from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import json
import logging
from datetime import datetime
from app.config import Config
from app.database import db
from app.utils import generate_job_id, format_response, serialize_payload, parse_payload

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

# Initialize Redis connection
try:
    redis_client = redis.from_url(Config.REDIS_URL)
    redis_client.ping()
    logger.info("✅ Redis connected successfully")
except Exception as e:
    logger.error(f"❌ Redis connection error: {e}")
    redis_client = None

# Initialize database
db.connect()
db.init_db()

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'redis': 'connected' if redis_client else 'disconnected',
        'database': 'connected' if db.conn else 'disconnected'
    }), 200

# ============================================================================
# JOB SUBMISSION
# ============================================================================

@app.route('/api/jobs/submit', methods=['POST'])
def submit_job():
    """
    Submit a new job to the queue
    
    Request body:
    {
        "name": "send_email",
        "payload": {"email": "user@example.com", "subject": "Welcome"},
        "priority": 1,
        "scheduled_for": "2024-01-15T10:00:00"  # optional
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({
                'error': 'Request body is required',
                'status': 'error'
            }), 400
        
        if not data.get('name'):
            return jsonify({
                'error': 'Job name is required',
                'status': 'error'
            }), 400
        
        # Generate job ID
        job_id = generate_job_id()
        job_name = data['name']
        payload = serialize_payload(data.get('payload', {}))
        priority = int(data.get('priority', 0))
        scheduled_for = data.get('scheduled_for')
        queue_name = 'default'
        
        # Save to database
        cursor = db.get_cursor()
        cursor.execute("""
            INSERT INTO jobs (id, name, status, payload, priority, queue_name, scheduled_for)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (job_id, job_name, 'PENDING', payload, priority, queue_name, scheduled_for))
        db.conn.commit()
        cursor.close()
        
        # Add to Redis queue
        job_data = {
            'id': job_id,
            'name': job_name,
            'payload': payload,
            'priority': priority,
            'created_at': datetime.utcnow().isoformat()
        }
        
        if redis_client:
            score = -priority if not scheduled_for else 0
            redis_client.zadd(f"queue:{queue_name}", {json.dumps(job_data): score})
        
        logger.info(f"✅ Job {job_id} submitted: {job_name}")
        
        return jsonify({
            'job_id': job_id,
            'status': 'PENDING',
            'message': 'Job submitted successfully',
            'name': job_name
        }), 201
        
    except Exception as e:
        logger.error(f"Error submitting job: {str(e)}")
        return jsonify({
            'error': f'Failed to submit job: {str(e)}',
            'status': 'error'
        }), 500

# ============================================================================
# GET JOB STATUS
# ============================================================================

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job status"""
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
        result = cursor.fetchone()
        cursor.close()
        
        if not result:
            return jsonify({
                'error': 'Job not found',
                'status': 'error'
            }), 404
        
        job_dict = dict(result)
        job_dict['payload'] = parse_payload(job_dict['payload'])
        job_dict['result'] = parse_payload(job_dict['result']) if job_dict['result'] else None
        
        return jsonify(job_dict), 200
        
    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
        return jsonify({
            'error': f'Failed to get job: {str(e)}',
            'status': 'error'
        }), 500

# ============================================================================
# CANCEL JOB
# ============================================================================

@app.route('/api/jobs/<job_id>/cancel', methods=['POST'])
def cancel_job(job_id):
    """Cancel a pending job"""
    try:
        cursor = db.get_cursor()
        cursor.execute("SELECT status FROM jobs WHERE id = %s", (job_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({
                'error': 'Job not found',
                'status': 'error'
            }), 404
        
        if result['status'] != 'PENDING':
            return jsonify({
                'error': f'Can only cancel PENDING jobs. Current status: {result["status"]}',
                'status': 'error'
            }), 400
        
        cursor.execute("""
            UPDATE jobs 
            SET status = %s, error = %s, completed_at = %s
            WHERE id = %s
        """, ('FAILED', 'Cancelled by user', datetime.utcnow(), job_id))
        db.conn.commit()
        cursor.close()
        
        logger.info(f"✅ Job {job_id} cancelled")
        
        return jsonify({
            'message': 'Job cancelled successfully',
            'job_id': job_id,
            'status': 'FAILED'
        }), 200
        
    except Exception as e:
        logger.error(f"Error cancelling job: {str(e)}")
        return jsonify({
            'error': f'Failed to cancel job: {str(e)}',
            'status': 'error'
        }), 500

# ============================================================================
# JOB HISTORY
# ============================================================================

@app.route('/api/jobs/history', methods=['GET'])
def job_history():
    """Get job history with filtering"""
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        status = request.args.get('status')
        
        cursor = db.get_cursor()
        
        # Build query
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = %s"
            params.append(status.upper())
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        jobs = cursor.fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) as count FROM jobs WHERE 1=1"
        count_params = []
        if status:
            count_query += " AND status = %s"
            count_params.append(status.upper())
        
        cursor.execute(count_query, count_params)
        total = cursor.fetchone()['count']
        cursor.close()
        
        # Parse payloads
        jobs_list = []
        for job in jobs:
            job_dict = dict(job)
            job_dict['payload'] = parse_payload(job_dict['payload']) if job_dict['payload'] else None
            job_dict['result'] = parse_payload(job_dict['result']) if job_dict['result'] else None
            jobs_list.append(job_dict)
        
        return jsonify({
            'jobs': jobs_list,
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        return jsonify({
            'error': f'Failed to get history: {str(e)}',
            'status': 'error'
        }), 500

# ============================================================================
# METRICS DASHBOARD
# ============================================================================

@app.route('/api/metrics/dashboard', methods=['GET'])
def dashboard_metrics():
    """Get real-time metrics for dashboard"""
    try:
        cursor = db.get_cursor()
        
        # Total jobs
        cursor.execute("SELECT COUNT(*) as count FROM jobs")
        total = cursor.fetchone()['count']
        
        # Jobs by status
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM jobs 
            GROUP BY status
        """)
        status_breakdown = {}
        for row in cursor.fetchall():
            status_breakdown[row['status']] = row['count']
        
        # Success rate
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
            FROM jobs
        """)
        result = cursor.fetchone()
        completed = result['completed'] or 0
        failed = result['failed'] or 0
        
        success_rate = (completed / (completed + failed) * 100) if (completed + failed) > 0 else 0
        
        # Average execution time
        cursor.execute("""
            SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_time
            FROM jobs
            WHERE completed_at IS NOT NULL AND started_at IS NOT NULL
        """)
        avg_time_result = cursor.fetchone()
        avg_time = avg_time_result['avg_time'] if avg_time_result['avg_time'] else 0
        
        # Queue depth
        queue_depth = redis_client.zcard("queue:default") if redis_client else 0
        
        cursor.close()
        
        return jsonify({
            'total_jobs': total,
            'status_breakdown': status_breakdown,
            'success_rate': round(success_rate, 2),
            'average_execution_time_seconds': round(float(avg_time), 2),
            'queue_depth': queue_depth,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return jsonify({
            'error': f'Failed to get metrics: {str(e)}',
            'status': 'error'
        }), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error',
        'code': 404
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {str(error)}")
    return jsonify({
        'error': 'Internal server error',
        'status': 'error',
        'code': 500
    }), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("🚀 Starting Flask API on http://localhost:5000")
    logger.info(f"📊 Environment: {Config.FLASK_ENV}")
    logger.info(f"🔐 Debug mode: {Config.DEBUG}")
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000, use_reloader=True)