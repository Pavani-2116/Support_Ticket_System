import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadTickets = async (status = '', q = '') => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (q) params.search = q;
      const res = await api.get('/tickets', { params });
      setTickets(res.data);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Agent Dashboard</h2>
        <div style={{ display: 'flex', gap: 24 }}>
          <div><strong>{stats.total}</strong><div style={{ fontSize: 12, color: '#888' }}>Total</div></div>
          <div><strong>{stats.open}</strong><div style={{ fontSize: 12, color: '#888' }}>Open</div></div>
          <div><strong>{stats.in_progress}</strong><div style={{ fontSize: 12, color: '#888' }}>In Progress</div></div>
          <div><strong>{stats.closed}</strong><div style={{ fontSize: 12, color: '#888' }}>Closed</div></div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            placeholder="Search by subject..."
            value={search}
            onChange={e => { setSearch(e.target.value); loadTickets(statusFilter, e.target.value); }}
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); loadTickets(e.target.value, search); }}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && <div className="error">{error}</div>}
        {loading ? (
          <div className="loading">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty">No tickets found.</div>
        ) : (
          tickets.map(t => (
            <Link to={`/ticket/${t.id}`} key={t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="ticket-row">
                <div>
                  <strong>{t.subject}</strong>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {t.customer_name} ({t.customer_email})
                  </div>
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
