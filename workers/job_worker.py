import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import time
import logging
import sys
from datetime import datetime, timedelta
from app.config import Config
from workers.tasks import execute_task

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class JobWorker:
    """Worker that processes jobs from Redis queue"""
    
    def __init__(self, worker_id="worker-1"):
        self.worker_id = worker_id
        self.redis_client = redis.from_url(Config.REDIS_URL)
        self.running = True
        self.processed_count = 0
        self.failed_count = 0
        
        logger.info(f"Worker {worker_id} initialized")
    
    def get_db_connection(self):
        """Get a new database connection"""
        try:
            conn = psycopg2.connect(Config.DATABASE_URL)
            return conn
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return None
    
    def start(self):
        """Start processing jobs from queue"""
        logger.info(f"🚀 Worker {self.worker_id} started")
        logger.info(f"⏰ Listening for jobs on queue: default")
        
        while self.running:
            try:
                # Pop job from queue with 5 second timeout
                result = self.redis_client.bzpopmin("queue:default", timeout=5)
                
                if result:
                    _, job_data, _ = result
                    job = json.loads(job_data)
                    self.process_job(job)
                
            except KeyboardInterrupt:
                logger.info(f"⏹️  Worker {self.worker_id} stopping...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"❌ Worker error: {e}")
                time.sleep(1)
        
        # Print summary
        logger.info(f"Worker summary - Processed: {self.processed_count}, Failed: {self.failed_count}")
    
    def process_job(self, job):
        """Process a single job"""
        job_id = job['id']
        job_name = job['name']
        payload = json.loads(job['payload'])
        
        logger.info(f"⚡ Processing job {job_id}: {job_name}")
        
        conn = self.get_db_connection()
        if not conn:
            logger.error("Cannot connect to database")
            return
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            # Mark as RUNNING
            cursor.execute("""
                UPDATE jobs 
                SET status = %s, started_at = %s, worker_id = %s
                WHERE id = %s
            """, ('RUNNING', datetime.utcnow(), self.worker_id, job_id))
            conn.commit()
            
            start_time = time.time()
            
            # Execute the task
            result = execute_task(job_name, payload)
            
            # Mark as COMPLETED
            cursor.execute("""
                UPDATE jobs 
                SET status = %s, result = %s, completed_at = %s
                WHERE id = %s
            """, ('COMPLETED', json.dumps(result), datetime.utcnow(), job_id))
            conn.commit()
            
            duration = time.time() - start_time
            self.processed_count += 1
            
            logger.info(f"✅ Job {job_id} completed in {duration:.2f}s")
            
        except Exception as e:
            # Mark as FAILED
            error_msg = str(e)
            logger.error(f"❌ Job {job_id} failed: {error_msg}")
            
            cursor.execute("""
                SELECT retries, max_retries FROM jobs WHERE id = %s
            """, (job_id,))
            result = cursor.fetchone()
            
            if result:
                retries = result['retries'] + 1
                max_retries = result['max_retries']
                
                if retries < max_retries:
                    # Retry with exponential backoff
                    delay = 2 ** retries  # 2, 4, 8 seconds
                    scheduled_time = datetime.utcnow() + timedelta(seconds=delay)
                    
                    cursor.execute("""
                        UPDATE jobs 
                        SET status = %s, error = %s, retries = %s, scheduled_for = %s
                        WHERE id = %s
                    """, ('RETRYING', error_msg, retries, scheduled_time, job_id))
                    
                    logger.warning(f"⚠️  Job {job_id} will retry in {delay}s (attempt {retries}/{max_retries})")
                else:
                    # Permanent failure
                    cursor.execute("""
                        UPDATE jobs 
                        SET status = %s, error = %s, retries = %s, completed_at = %s
                        WHERE id = %s
                    """, ('FAILED', error_msg, retries, datetime.utcnow(), job_id))
                    
                    self.failed_count += 1
                    logger.error(f"❌ Job {job_id} failed permanently after {max_retries} retries")
            
            conn.commit()
            
        finally:
            cursor.close()
            conn.close()

def main():
    """Main entry point"""
    # Get worker ID from command line argument
    worker_id = sys.argv[1] if len(sys.argv) > 1 else "worker-1"
    
    # Create and start worker
    worker = JobWorker(worker_id)
    
    try:
        worker.start()
    except KeyboardInterrupt:
        logger.info("Worker interrupted by user")

if __name__ == '__main__':
    main()