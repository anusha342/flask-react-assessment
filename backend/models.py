from datetime import datetime, UTC
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['task_comments_db']
tasks_collection = db['tasks']
comments_collection = db['comments']


class Task:
    
    @classmethod
    def create(cls, title, description='', status='pending'):
        task = {
            'title': title,
            'description': description,
            'status': status,
            'created_at': datetime.now(UTC).isoformat(),
            'updated_at': datetime.now(UTC).isoformat()
        }
        result = tasks_collection.insert_one(task)
        task['id'] = str(result.inserted_id)
        task['_id'] = str(result.inserted_id)
        print(f"[CREATE] Task created: {task}")
        return task
    
    @classmethod
    def get_all(cls):
        tasks = list(tasks_collection.find())
        for task in tasks:
            task['id'] = str(task['_id'])
            task['_id'] = str(task['_id'])
        print(f"[GET ALL] Fetched {len(tasks)} tasks")
        return tasks
    
    @classmethod
    def get_by_id(cls, task_id):
        try:
            task = tasks_collection.find_one({'_id': ObjectId(task_id)})
            if task:
                task['id'] = str(task['_id'])
                task['_id'] = str(task['_id'])
                print(f"[GET] Task found: {task}")
            return task
        except:
            return None
    
    @classmethod
    def update(cls, task_id, title=None, description=None, status=None):
        try:
            update_data = {'updated_at': datetime.now(UTC).isoformat()}
            if title is not None:
                update_data['title'] = title
            if description is not None:
                update_data['description'] = description
            if status is not None:
                update_data['status'] = status
            
            result = tasks_collection.find_one_and_update(
                {'_id': ObjectId(task_id)},
                {'$set': update_data},
                return_document=True
            )
            if result:
                result['id'] = str(result['_id'])
                result['_id'] = str(result['_id'])
                print(f"[UPDATE] Task updated: {result}")
            return result
        except:
            return None
    
    @classmethod
    def delete(cls, task_id):
        try:
            result = tasks_collection.find_one_and_delete({'_id': ObjectId(task_id)})
            if result:
                result['id'] = str(result['_id'])
                print(f"[DELETE] Task deleted: {result}")
            return result
        except:
            return None

class Comment:
    
    @classmethod
    def create(cls, task_id, content, author='Anonymous'):
        comment = {
            'task_id': task_id,
            'content': content,
            'author': author,
            'created_at': datetime.now(UTC).isoformat(),
            'updated_at': datetime.now(UTC).isoformat()
        }
        result = comments_collection.insert_one(comment)
        comment['id'] = str(result.inserted_id)
        comment['_id'] = str(result.inserted_id)
        return comment
    
    @classmethod
    def get_all(cls, task_id=None):
        query = {'task_id': task_id} if task_id else {}
        comments = list(comments_collection.find(query))
        for comment in comments:
            comment['id'] = str(comment['_id'])
            comment['_id'] = str(comment['_id'])
        return comments
    
    @classmethod
    def get_by_id(cls, comment_id):
        try:
            comment = comments_collection.find_one({'_id': ObjectId(comment_id)})
            if comment:
                comment['id'] = str(comment['_id'])
                comment['_id'] = str(comment['_id'])
            return comment
        except:
            return None
    
    @classmethod
    def update(cls, comment_id, content=None, author=None):
        try:
            update_data = {'updated_at': datetime.now(UTC).isoformat()}
            if content:
                update_data['content'] = content
            if author:
                update_data['author'] = author
            
            result = comments_collection.find_one_and_update(
                {'_id': ObjectId(comment_id)},
                {'$set': update_data},
                return_document=True
            )
            if result:
                result['id'] = str(result['_id'])
                result['_id'] = str(result['_id'])
            return result
        except:
            return None
    
    @classmethod
    def delete(cls, comment_id):
        try:
            result = comments_collection.find_one_and_delete({'_id': ObjectId(comment_id)})
            if result:
                result['id'] = str(result['_id'])
            return result
        except:
            return None
    
    @classmethod
    def clear_all(cls):
        comments_collection.delete_many({})
