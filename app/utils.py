import uuid
import json
from datetime import datetime

def generate_job_id():
    """Generate unique job ID"""
    return str(uuid.uuid4())

def get_timestamp():
    """Get current UTC timestamp in ISO format"""
    return datetime.utcnow().isoformat()

def parse_payload(data):
    """Parse JSON payload"""
    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            return {}
    return data

def serialize_payload(data):
    """Serialize data to JSON string"""
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        return json.dumps({})

def format_response(data=None, message=None, status='success', code=200):
    """Format API response"""
    response = {
        'status': status,
        'code': code,
        'timestamp': get_timestamp()
    }
    
    if message:
        response['message'] = message
    if data:
        response['data'] = data
    
    return response