from datetime import datetime
import json

class Job:
    """Job model"""
    
    def __init__(self, id, name, status, payload, priority=0, result=None, error=None):
        self.id = id
        self.name = name
        self.status = status  # PENDING, RUNNING, COMPLETED, FAILED, RETRYING
        self.payload = payload
        self.priority = priority
        self.result = result
        self.error = error
        self.retries = 0
        self.max_retries = 3
        self.created_at = datetime.utcnow()
        self.started_at = None
        self.completed_at = None
        self.worker_id = None
        self.queue_name = 'default'
    
    def to_dict(self):
        """Convert job to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'payload': json.loads(self.payload) if isinstance(self.payload, str) else self.payload,
            'result': self.result,
            'error': self.error,
            'retries': self.retries,
            'max_retries': self.max_retries,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'worker_id': self.worker_id,
            'queue_name': self.queue_name
        }
    
    def from_dict(cls, data):
        """Create job from dictionary"""
        job = cls(
            data['id'],
            data['name'],
            data['status'],
            data.get('payload', '{}'),
            data.get('priority', 0)
        )
        job.result = data.get('result')
        job.error = data.get('error')
        return job