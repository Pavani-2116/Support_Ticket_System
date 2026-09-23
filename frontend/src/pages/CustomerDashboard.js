import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });

  const loadTickets = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/tickets', { params: q ? { search: q } : {} });
      setTickets(res.data);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', form);
      setForm({ subject: '', description: '', priority: 'medium' });
      setShowForm(false);
      loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create ticket');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Tickets</h2>
          <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Ticket'}</button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
            <label>Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit">Create Ticket</button>
          </form>
        )}
      </div>

      <div className="card">
        <input
          placeholder="Search tickets..."
          value={search}
          onChange={e => { setSearch(e.target.value); loadTickets(e.target.value); }}
        />
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty">No tickets yet. Create one above.</div>
        ) : (
          tickets.map(t => (
            <Link to={`/ticket/${t.id}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ticket-row">
                <div>
                  <strong>{t.subject}</strong>
                  <div style={{ fontSize: 12, color: '#888' }}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span className={`badge ${t.priority}`}>{t.priority}</span>{' '}
                  <span className={`badge ${t.status}`}>{t.status}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
