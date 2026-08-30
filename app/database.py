import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from app.config import Config

logger = logging.getLogger(__name__)

class Database:
    """Database connection and initialization"""
    
    def __init__(self):
        self.conn = None
    
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(Config.DATABASE_URL)
            logger.info("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            logger.error(f"❌ Database connection error: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_cursor(self):
        """Get database cursor with dict result"""
        if not self.conn:
            self.connect()
        return self.conn.cursor(cursor_factory=RealDictCursor)
    
    def init_db(self):
        """Create tables if they don't exist"""
        cursor = self.get_cursor()
        
        sql = """
        CREATE TABLE IF NOT EXISTS jobs (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
            payload TEXT,
            result TEXT,
            error TEXT,
            retries INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            priority INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            scheduled_for TIMESTAMP,
            queue_name VARCHAR(50) DEFAULT 'default',
            worker_id VARCHAR(255)
        );
        
        CREATE INDEX IF NOT EXISTS idx_status ON jobs(status);
        CREATE INDEX IF NOT EXISTS idx_created ON jobs(created_at);
        CREATE INDEX IF NOT EXISTS idx_scheduled ON jobs(scheduled_for);
        CREATE INDEX IF NOT EXISTS idx_queue ON jobs(queue_name);
        """
        
        try:
            cursor.execute(sql)
            self.conn.commit()
            logger.info("✅ Database tables created successfully")
        except psycopg2.Error as e:
            logger.error(f"❌ Error creating tables: {e}")
            self.conn.rollback()
        finally:
            cursor.close()

# Global database instance
db = Database()