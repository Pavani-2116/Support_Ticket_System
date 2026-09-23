const router = require('express').Router();
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/users?role=agent  (agent-only, used to populate the "assign to" dropdown)
router.get('/', authenticate, requireRole('agent'), async (req, res) => {
  const role = req.query.role;
  const sql = role
    ? 'SELECT id, name, email, role FROM users WHERE role = ?'
    : 'SELECT id, name, email, role FROM users';
  const [rows] = await pool.execute(sql, role ? [role] : []);
  res.json(rows);
});

module.exports = router;
