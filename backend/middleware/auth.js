// backend/middleware/auth.js
const { auth } = require('../services/firebase');

// ── Verify Firebase Token ────────────────────────────────────
async function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token' });
  }
  try {
    const token = header.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Check Organizer Role ─────────────────────────────────────
async function requireOrganizer(req, res, next) {
  await verifyToken(req, res, async () => {
    if (req.user.role === 'organizer' || req.user.role === 'superadmin') return next();
    res.status(403).json({ error: 'Organizer access required' });
  });
}

// ── Check Super Admin Role ───────────────────────────────────
async function requireSuperAdmin(req, res, next) {
  await verifyToken(req, res, async () => {
    if (req.user.role === 'superadmin') return next();
    res.status(403).json({ error: 'Super admin access required' });
  });
}

module.exports = { verifyToken, requireOrganizer, requireSuperAdmin };
