import pytest
import json
import redis
from app.main import app, redis_client
from app.database import db

@pytest.fixture
def client():
    """Test client fixture"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_submit_job(client):
    """Test job submission"""
    payload = {
        'name': 'send_email',
        'payload': {
            'email': 'test@example.com',
            'subject': 'Test Email'
        },
        'priority': 1
    }
    
    response = client.post('/api/jobs/submit',
        json=payload,
        content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'job_id' in data
    assert data['status'] == 'PENDING'
    assert data['name'] == 'send_email'

def test_submit_job_queued_to_default_queue(client):
    """Jobs should be queued on the default Redis queue the worker consumes"""
    if redis_client:
        redis_client.delete('queue:default')

    payload = {
        'name': 'send_email',
        'payload': {'email': 'test@example.com', 'subject': 'Test Queue'},
        'priority': 1
    }

    response = client.post('/api/jobs/submit',
        json=payload,
        content_type='application/json')

    assert response.status_code == 201
    if redis_client:
        assert redis_client.zcard('queue:default') > 0


def test_submit_job_missing_name(client):
    """Test job submission without name"""
    payload = {'payload': {'email': 'test@example.com'}}
    response = client.post('/api/jobs/submit',
        json=payload,
        content_type='application/json')
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_get_job_status(client):
    """Test get job status"""
    # First submit a job
    submit_payload = {
        'name': 'send_email',
        'payload': {'email': 'test@example.com'}
    }
    
    response = client.post('/api/jobs/submit',
        json=submit_payload,
        content_type='application/json')
    
    assert response.status_code == 201
    job_id = json.loads(response.data)['job_id']
    
    # Then get its status
    response = client.get(f'/api/jobs/{job_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == job_id
    assert data['status'] == 'PENDING'

def test_get_job_not_found(client):
    """Test get non-existent job"""
    response = client.get('/api/jobs/nonexistent-id')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data

def test_cancel_job(client):
    """Test job cancellation"""
    # Submit a job
    payload = {
        'name': 'send_email',
        'payload': {'email': 'test@example.com'}
    }
    
    response = client.post('/api/jobs/submit',
        json=payload,
        content_type='application/json')
    
    job_id = json.loads(response.data)['job_id']
    
    # Cancel it
    response = client.post(f'/api/jobs/{job_id}/cancel')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'FAILED'

def test_metrics_dashboard(client):
    """Test metrics dashboard"""
    response = client.get('/api/metrics/dashboard')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_jobs' in data
    assert 'success_rate' in data
    assert 'queue_depth' in data
    assert 'status_breakdown' in data

def test_job_history(client):
    """Test job history endpoint"""
    response = client.get('/api/jobs/history')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'jobs' in data
    assert 'total' in data
    assert isinstance(data['jobs'], list)