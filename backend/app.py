# Task 1: Comments CRUD APIs


from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import Task, Comment

load_dotenv()

app = Flask(__name__)
CORS(app)

# ============ TASK ROUTES ============

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.get_all()
    return jsonify(tasks), 200

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.get_by_id(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    print(f"[API] Received create task request: {data}")
    if not data or 'title' not in data:
        return jsonify({'error': 'title is required'}), 400
    
    task = Task.create(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'pending')
    )
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    print(f"[API] Received update task request for {task_id}: {data}")
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    task = Task.update(
        task_id,
        title=data.get('title'),
        description=data.get('description'),
        status=data.get('status')
    )
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify(task), 200

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    print(f"[API] Received delete task request for {task_id}")
    task = Task.delete(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({'message': 'Task deleted successfully'}), 200

# ============ COMMENT ROUTES ============

@app.route('/api/comments', methods=['GET'])
def get_comments():
    task_id = request.args.get('task_id')
    print(f"[API] Fetching comments for task_id: {task_id}")
    comments = Comment.get_all(task_id)
    return jsonify(comments), 200

@app.route('/api/comments/<comment_id>', methods=['GET'])
def get_comment(comment_id):
    comment = Comment.get_by_id(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    return jsonify(comment), 200

@app.route('/api/comments', methods=['POST'])
def create_comment():
    data = request.get_json()
    print(f"[API] Creating comment: {data}")
    if not data or 'task_id' not in data or 'content' not in data:
        return jsonify({'error': 'task_id and content are required'}), 400
    
    comment = Comment.create(
        task_id=data['task_id'],
        content=data['content'],
        author=data.get('author', 'Anonymous')
    )
    return jsonify(comment), 201

@app.route('/api/comments/<comment_id>', methods=['PUT'])
def update_comment(comment_id):
    data = request.get_json()
    print(f"[API] Updating comment {comment_id}: {data}")
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    comment = Comment.update(
        comment_id,
        content=data.get('content'),
        author=data.get('author')
    )
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    return jsonify(comment), 200

@app.route('/api/comments/<comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    print(f"[API] Deleting comment: {comment_id}")
    comment = Comment.delete(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    return jsonify({'message': 'Comment deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
