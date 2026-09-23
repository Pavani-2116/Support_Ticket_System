import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      setTicket(tRes.data);
      setComments(cRes.data);
      if (user?.role === 'agent') {
        const aRes = await api.get('/users', { params: { role: 'agent' } });
        setAgents(aRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tickets/${id}/comments`, { comment: newComment });
      setNewComment('');
      load();
    } catch (err) {
      setError('Could not add comment');
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      await api.put(`/tickets/${id}`, { [field]: value });
      load();
    } catch (err) {
      setError('Update failed');
    }
  };

  if (loading) return <div className="container loading">Loading...</div>;
  if (error && !ticket) return <div className="container error">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="container">
      <button className="secondary" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>&larr; Back</button>

      <div className="card">
        <h2>{ticket.subject}</h2>
        <p>{ticket.description}</p>
        <div style={{ marginBottom: 12 }}>
          <span className={`badge ${ticket.priority}`}>{ticket.priority}</span>{' '}
          <span className={`badge ${ticket.status}`}>{ticket.status}</span>
        </div>

        {user?.role === 'agent' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12 }}>Status</label>
              <select value={ticket.status} onChange={e => handleUpdate('status', e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12 }}>Priority</label>
              <select value={ticket.priority} onChange={e => handleUpdate('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12 }}>Assign to</label>
              <select value={ticket.assigned_to || ''} onChange={e => handleUpdate('assigned_to', e.target.value || null)}>
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Comments</h3>
        {comments.length === 0 && <div className="empty">No comments yet.</div>}
        {comments.map(c => (
          <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <strong>{c.author_name}</strong>{' '}
            <span style={{ fontSize: 12, color: '#888' }}>({c.author_role}) · {new Date(c.created_at).toLocaleString()}</span>
            <p style={{ margin: '4px 0 0' }}>{c.comment}</p>
          </div>
        ))}
        <form onSubmit={handleCommentSubmit} style={{ marginTop: 16 }}>
          <textarea rows={2} placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
}
