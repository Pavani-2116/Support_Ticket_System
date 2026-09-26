const jwt = require('jsonwebtoken');

// authenticate: WHO are you? Required on every protected route.
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// requireRole: WHAT are you allowed to do? Used on agent-only routes.
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
