const jwt = require('jsonwebtoken');

function requireAuth(roles) {
  return function(req, res, next) {
    try {
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
      if (roles && roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

function requireAnyAuth() {
  return function(req, res, next) {
    try {
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

function requireAdmin() {
  return function(req, res, next) {
    // First verify authentication
    try {
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
      req.user = payload;
      
      // Then check if user is admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}

module.exports = { requireAuth, requireAnyAuth, requireAdmin };


