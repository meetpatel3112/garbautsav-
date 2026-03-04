// backend/routes/admin.js  — Secure Admin Login
const router = require('express').Router();
const crypto = require('crypto');

// ── Allowed admin emails ──────────────────────────────
const ADMIN_EMAILS = [
  'admin@garbautsav.com',
  // Apni email bhi add kar sakte ho:
  // 'meetpatel3112@gmail.com',
];

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email aur password required' });
  }

  const validEmail    = ADMIN_EMAILS.includes(email.toLowerCase().trim());
  const correctPass   = process.env.ADMIN_SECRET_KEY;
  const passwordMatch = password === correctPass;

  if (!validEmail || !passwordMatch) {
    // Small delay to prevent brute force
    return setTimeout(() => {
      res.status(401).json({ success: false, error: 'Galat email ya password' });
    }, 1000);
  }

  // Generate simple session token
  const token = crypto.randomBytes(32).toString('hex');

  res.json({
    success: true,
    token,
    user: {
      name: 'GarbaUtsav Admin',
      email,
      role: 'superadmin',
      uid: 'admin_001',
      city: process.env.COMPANY_CITY || 'Ahmedabad',
    }
  });
});

// GET /api/admin/stats — Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { db } = require('../services/firebase');
    const bookingsSnap = await db.collection('bookings').get();
    const bookings = bookingsSnap.docs.map(d => d.data());

    const totalRevenue  = bookings.reduce((s, b) => s + (b.finalAmount || 0), 0);
    const totalBookings = bookings.length;
    const todayBookings = bookings.filter(b => {
      const d = new Date(b.createdAt);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;

    res.json({ totalRevenue, totalBookings, todayBookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bookings — All bookings list
router.get('/bookings', async (req, res) => {
  try {
    const { db } = require('../services/firebase');
    const snap = await db.collection('bookings').orderBy('createdAt', 'desc').limit(100).get();
    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
