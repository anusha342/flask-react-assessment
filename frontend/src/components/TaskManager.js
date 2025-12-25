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
  
  // Comments state
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ content: '', author: '' });
  const [editingCommentId, setEditingCommentId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(TASKS_API);
      console.log('[Frontend] Fetched tasks:', response.data);
      setTasks(response.data);
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

  // Comments CRUD
  const openComments = async (task) => {
    setSelectedTask(task);
    try {
      const response = await axios.get(`${COMMENTS_API}?task_id=${task.id}`);
      console.log('[Frontend] Fetched comments:', response.data);
      setComments(response.data);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const closeComments = () => {
    setSelectedTask(null);
    setComments([]);
    setCommentForm({ content: '', author: '' });
    setEditingCommentId(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentForm.content.trim()) {
      toast.warning('Please enter a comment');
      return;
    }
    try {
      if (editingCommentId) {
        const response = await axios.put(`${COMMENTS_API}/${editingCommentId}`, commentForm);
        console.log('[Frontend] Updated comment:', response.data);
        setComments(comments.map(c => c.id === editingCommentId ? response.data : c));
        toast.success('Comment updated');
        setEditingCommentId(null);
      } else {
        const response = await axios.post(COMMENTS_API, {
          task_id: selectedTask.id,
          content: commentForm.content,
          author: commentForm.author || 'Anonymous'
        });
        console.log('[Frontend] Created comment:', response.data);
        setComments([...comments, response.data]);
        toast.success('Comment added');
      }
      setCommentForm({ content: '', author: '' });
    } catch (error) {
      toast.error('Failed to save comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentForm({ content: comment.content, author: comment.author });
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`${COMMENTS_API}/${id}`);
      console.log('[Frontend] Deleted comment:', id);
      setComments(comments.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setCommentForm({ content: '', author: '' });
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
              <div className="task-footer">
                <span className="task-date">{new Date(task.created_at).toLocaleDateString()}</span>
                <div className="task-actions">
                  <button className="btn btn-comment" onClick={() => openComments(task)}>Comments</button>
                  <button className="btn btn-edit" onClick={() => handleEdit(task)}>Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comments Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={closeComments}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comments: {selectedTask.title}</h2>
              <button className="close-btn" onClick={closeComments}>&times;</button>
            </div>
            
            <div className="comment-form-modal">
              <form onSubmit={handleCommentSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={commentForm.author}
                    onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Write a comment..."
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingCommentId ? 'Update' : 'Add Comment'}
                  </button>
                  {editingCommentId && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={cancelCommentEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="comments-list-modal">
              {comments.length === 0 ? (
                <div className="no-comments-modal">No comments yet</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header-modal">
                      <strong>{comment.author}</strong>
                      <span className="comment-date-modal">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-content-modal">{comment.content}</p>
                    <div className="comment-actions-modal">
                      <button className="btn-link" onClick={() => handleEditComment(comment)}>Edit</button>
                      <button className="btn-link delete" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskManager;
