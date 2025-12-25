import pytest
import json
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from models import Comment

@pytest.fixture
def client():
    app.config['TESTING'] = True
    Comment.clear_all()
    with app.test_client() as client:
        yield client
    Comment.clear_all()

def test_create_comment(client):
    response = client.post('/api/comments', 
        json={'task_id': 1, 'content': 'Test comment', 'author': 'John'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['content'] == 'Test comment'
    assert data['author'] == 'Anusha'
    assert data['task_id'] == 1
    assert 'id' in data

def test_get_all_comments(client):
    client.post('/api/comments', json={'task_id': 1, 'content': 'Comment 1'})
    client.post('/api/comments', json={'task_id': 1, 'content': 'Comment 2'})
    response = client.get('/api/comments')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) >= 2

def test_get_comments_by_task(client):
    client.post('/api/comments', json={'task_id': 1, 'content': 'Task 1 comment'})
    client.post('/api/comments', json={'task_id': 2, 'content': 'Task 2 comment'})
    response = client.get('/api/comments?task_id=1')
    data = json.loads(response.data)
    assert len(data) >= 1
    for comment in data:
        assert comment['task_id'] == 1

def test_get_comment_by_id(client):
    create_response = client.post('/api/comments', 
        json={'task_id': 1, 'content': 'Test'})
    comment_id = json.loads(create_response.data)['id']
    response = client.get(f'/api/comments/{comment_id}')
    assert response.status_code == 200

def test_update_comment(client):
    create_response = client.post('/api/comments', 
        json={'task_id': 1, 'content': 'Original'})
    comment_id = json.loads(create_response.data)['id']
    response = client.put(f'/api/comments/{comment_id}', 
        json={'content': 'Updated'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['content'] == 'Updated'

def test_delete_comment(client):
    create_response = client.post('/api/comments', 
        json={'task_id': 1, 'content': 'To delete'})
    comment_id = json.loads(create_response.data)['id']
    response = client.delete(f'/api/comments/{comment_id}')
    assert response.status_code == 200
    get_response = client.get(f'/api/comments/{comment_id}')
    assert get_response.status_code == 404

def test_create_comment_missing_fields(client):
    response = client.post('/api/comments', json={'task_id': 1})
    assert response.status_code == 400

def test_update_nonexistent_comment(client):
    response = client.put('/api/comments/507f1f77bcf86cd799439011', json={'content': 'Test'})
    assert response.status_code == 404

def test_delete_nonexistent_comment(client):
    response = client.delete('/api/comments/507f1f77bcf86cd799439011')
    assert response.status_code == 404
