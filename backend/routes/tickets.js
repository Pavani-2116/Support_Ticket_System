const router = require('express').Router();
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate); // every route below requires a valid token

// POST /api/tickets  (customer creates a ticket)
router.post('/', async (req, res) => {
  const { subject, description, priority } = req.body;
  if (!subject) return res.status(400).json({ error: 'Subject is required' });
  const [result] = await pool.execute(
    'INSERT INTO tickets (user_id, subject, description, priority) VALUES (?, ?, ?, ?)',
    [req.user.id, subject, description || '', priority || 'medium']
  );
  res.status(201).json({ id: result.insertId, subject, description, priority: priority || 'medium', status: 'open' });
});

// GET /api/tickets  (agent -> all, customer -> own only; supports ?status= & ?search=)
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  let sql, params;

  if (req.user.role === 'agent') {
    sql = 'SELECT t.*, u.name AS customer_name, u.email AS customer_email FROM tickets t JOIN users u ON t.user_id = u.id WHERE 1=1';
    params = [];
  } else {
    sql = 'SELECT * FROM tickets WHERE user_id = ?';
    params = [req.user.id];
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND subject LIKE ?';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const [rows] = await pool.execute(sql, params);
  res.json(rows);
});

// GET /api/tickets/:id  (owner or agent only)
router.get('/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = rows[0];
  if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not your ticket' });
  }
  res.json(ticket);
});

// PUT /api/tickets/:id  (agent only: status, priority, assignment)
router.put('/:id', requireRole('agent'), async (req, res) => {
  const [existing] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!existing.length) return res.status(404).json({ error: 'Ticket not found' });

  const current = existing[0];
  const status = req.body.status || current.status;
  const priority = req.body.priority || current.priority;
  const assigned_to = req.body.assigned_to !== undefined ? req.body.assigned_to : current.assigned_to;

  await pool.execute(
    'UPDATE tickets SET status = ?, priority = ?, assigned_to = ? WHERE id = ?',
    [status, priority, assigned_to, req.params.id]
  );
  res.json({ message: 'Ticket updated', id: req.params.id, status, priority, assigned_to });
});

// DELETE /api/tickets/:id  (agent only)
router.delete('/:id', requireRole('agent'), async (req, res) => {
  const [result] = await pool.execute('DELETE FROM tickets WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ message: 'Ticket deleted' });
});

// GET /api/tickets/:id/comments
router.get('/:id/comments', async (req, res) => {
  const [tRows] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!tRows.length) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = tRows[0];
  if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const [comments] = await pool.execute(
    `SELECT c.*, u.name AS author_name, u.role AS author_role
     FROM ticket_comments c JOIN users u ON c.user_id = u.id
     WHERE c.ticket_id = ? ORDER BY c.created_at ASC`,
    [req.params.id]
  );
  res.json(comments);
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', async (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment text is required' });
  const [tRows] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!tRows.length) return res.status(404).json({ error: 'Ticket not found' });
  const ticket = tRows[0];
  if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const [result] = await pool.execute(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [req.params.id, req.user.id, comment]
  );
  res.status(201).json({ id: result.insertId, ticket_id: req.params.id, comment });
});

module.exports = router;
