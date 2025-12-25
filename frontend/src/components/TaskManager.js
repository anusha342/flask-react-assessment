import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TASKS_API = 'http://localhost:5000/api/tasks';
const COMMENTS_API = 'http://localhost:5000/api/comments';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Comments state - now per task
  const [showCommentFormId, setShowCommentFormId] = useState(null);
  const [taskComments, setTaskComments] = useState({});
  const [commentForm, setCommentForm] = useState({ content: '' });
  const [editingCommentId, setEditingCommentId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all comments for all tasks on load
  const fetchAllComments = async (tasksList) => {
    try {
      const commentsMap = {};
      for (const task of tasksList) {
        const response = await axios.get(`${COMMENTS_API}?task_id=${task.id}`);
        commentsMap[task.id] = response.data;
      }
      setTaskComments(commentsMap);
    } catch (error) {
      console.error('[Frontend] Error fetching comments:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(TASKS_API);
      console.log('[Frontend] Fetched tasks:', response.data);
      setTasks(response.data);
      fetchAllComments(response.data);
    } catch (error) {
      console.error('[Frontend] Error fetching tasks:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Task CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Please enter a title');
      return;
    }
    try {
      if (editingId) {
        const response = await axios.put(`${TASKS_API}/${editingId}`, formData);
        setTasks(tasks.map(t => t.id === editingId ? response.data : t));
        toast.success('Task updated');
        setEditingId(null);
      } else {
        const response = await axios.post(TASKS_API, formData);
        setTasks([...tasks, response.data]);
        toast.success('Task added');
      }
      setFormData({ title: '', description: '', status: 'pending' });
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({ title: task.title, description: task.description, status: task.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${TASKS_API}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', status: 'pending' });
  };

  // Comments - toggle form only
  const toggleCommentForm = (task) => {
    if (showCommentFormId === task.id) {
      setShowCommentFormId(null);
      setEditingCommentId(null);
      setCommentForm({ content: '' });
      return;
    }
    setShowCommentFormId(task.id);
    setEditingCommentId(null);
    setCommentForm({ content: '' });
  };

  const handleCommentSubmit = async (e, taskId) => {
    e.preventDefault();
    if (!commentForm.content.trim()) {
      toast.warning('Please enter a comment');
      return;
    }
    try {
      if (editingCommentId) {
        const response = await axios.put(`${COMMENTS_API}/${editingCommentId}`, { content: commentForm.content });
        console.log('[Frontend] Updated comment:', response.data);
        setTaskComments(prev => ({
          ...prev,
          [taskId]: prev[taskId].map(c => c.id === editingCommentId ? response.data : c)
        }));
        toast.success('Comment updated');
        setEditingCommentId(null);
      } else {
        const response = await axios.post(COMMENTS_API, {
          task_id: taskId,
          content: commentForm.content,
          author: 'Anonymous'
        });
        console.log('[Frontend] Created comment:', response.data);
        setTaskComments(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), response.data]
        }));
        toast.success('Comment added');
      }
      setCommentForm({ content: '' });
      setShowCommentFormId(null);
    } catch (error) {
      toast.error('Failed to save comment');
    }
  };

  const handleEditComment = (comment, taskId) => {
    setShowCommentFormId(taskId);
    setEditingCommentId(comment.id);
    setCommentForm({ content: comment.content });
  };

  const handleDeleteComment = async (id, taskId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`${COMMENTS_API}/${id}`);
      console.log('[Frontend] Deleted comment:', id);
      setTaskComments(prev => ({
        ...prev,
        [taskId]: prev[taskId].filter(c => c.id !== id)
      }));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setCommentForm({ content: '' });
    setShowCommentFormId(null);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  if (loading) return <div className="no-tasks">Loading tasks...</div>;

  return (
    <>
      <div className="task-form">
        <h2>{editingId ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Add some details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save Changes' : 'Add Task'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="task-filters">
        {['all', 'pending', 'in-progress', 'completed'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="tasks-list">
        <h2>Tasks</h2>
        {filtered.length === 0 ? (
          <div className="no-tasks">No tasks yet. Add one above!</div>
        ) : (
          filtered.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`status-badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
              </div>
              {task.description && <p className="task-description">{task.description}</p>}
              
              {/* Comments always visible */}
              {(taskComments[task.id] || []).length > 0 && (
                <div className="task-comments-display">
                  {(taskComments[task.id] || []).map(comment => (
                    <div key={comment.id} className="comment-item-inline">
                      <p className="comment-content-inline">{comment.content}</p>
                      <div className="comment-meta-inline">
                        <span className="comment-date-inline">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        <div className="comment-actions-inline">
                          <button className="btn-link" onClick={() => handleEditComment(comment, task.id)}>Edit</button>
                          <button className="btn-link delete" onClick={() => handleDeleteComment(comment.id, task.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="task-footer">
                <span className="task-date">{new Date(task.created_at).toLocaleDateString()}</span>
                <div className="task-actions">
                  <button className="btn btn-comment" onClick={() => toggleCommentForm(task)}>
                    {showCommentFormId === task.id ? 'Cancel' : 'Add Comment'}
                  </button>
                  <button className="btn btn-edit" onClick={() => handleEdit(task)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
              
              {/* Comment Form - only when clicked */}
              {showCommentFormId === task.id && (
                <div className="task-comments">
                  <form className="comment-form-inline" onSubmit={(e) => handleCommentSubmit(e, task.id)}>
                    <textarea
                      placeholder="Write a comment..."
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ content: e.target.value })}
                      autoFocus
                    />
                    <div className="comment-form-actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        {editingCommentId ? 'Update' : 'Add'}
                      </button>
                      {editingCommentId && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={cancelCommentEdit}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </>
  );
}

export default TaskManager;
