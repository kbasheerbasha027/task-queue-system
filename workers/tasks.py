import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================================
# EXAMPLE TASKS
# ============================================================================

def send_email(payload):
    """
    Example task: Send email
    
    Args:
        payload: {"email": "user@example.com", "subject": "Hello"}
    """
    email = payload.get('email')
    subject = payload.get('subject', 'No Subject')
    
    # Simulate email sending (1 second)
    time.sleep(1)
    
    logger.info(f"📧 Email sent to {email}: {subject}")
    
    return {
        'email': email,
        'subject': subject,
        'sent': True,
        'timestamp': datetime.utcnow().isoformat(),
        'provider': 'smtp'
    }

def process_video(payload):
    """
    Example task: Process video
    
    Args:
        payload: {"video_id": "vid123", "format": "mp4"}
    """
    video_id = payload.get('video_id')
    format = payload.get('format', 'mp4')
    
    # Simulate video processing (3 seconds)
    time.sleep(3)
    
    logger.info(f"🎬 Video {video_id} processed to {format}")
    
    return {
        'video_id': video_id,
        'format': format,
        'processed': True,
        'duration': '1080p@30fps',
        'file_size_mb': 250,
        'timestamp': datetime.utcnow().isoformat()
    }

def generate_report(payload):
    """
    Example task: Generate report
    
    Args:
        payload: {"report_id": "rpt123", "format": "pdf"}
    """
    report_id = payload.get('report_id')
    report_format = payload.get('format', 'pdf')
    
    # Simulate report generation (2 seconds)
    time.sleep(2)
    
    logger.info(f"📄 Report {report_id} generated in {report_format}")
    
    return {
        'report_id': report_id,
        'format': report_format,
        'generated': True,
        'pages': 15,
        'timestamp': datetime.utcnow().isoformat()
    }

def sync_data(payload):
    """
    Example task: Sync data
    
    Args:
        payload: {"source": "api", "count": 100}
    """
    source = payload.get('source', 'unknown')
    count = payload.get('count', 100)
    
    # Simulate data sync (1 second)
    time.sleep(1)
    
    logger.info(f"🔄 Synced {count} records from {source}")
    
    return {
        'source': source,
        'synced_count': count,
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat()
    }

# ============================================================================
# TASK REGISTRY
# ============================================================================

TASKS = {
    'send_email': send_email,
    'process_video': process_video,
    'generate_report': generate_report,
    'sync_data': sync_data,
}

def execute_task(task_name, payload):
    """
    Execute a task by name
    
    Args:
        task_name: Name of the task to execute
        payload: Payload/parameters for the task
    
    Returns:
        Task result dictionary
    
    Raises:
        ValueError: If task not found
    """
    if task_name not in TASKS:
        raise ValueError(f"Unknown task: {task_name}. Available tasks: {', '.join(TASKS.keys())}")
    
    try:
        logger.info(f"Executing task: {task_name}")
        result = TASKS[task_name](payload)
        return result
    except Exception as e:
        logger.error(f"Task execution failed: {str(e)}")
        raise