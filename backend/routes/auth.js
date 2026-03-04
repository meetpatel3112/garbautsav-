// backend/routes/auth.js
const router = require('express').Router();
const { auth, db } = require('../services/firebase');

// POST /api/auth/register-organizer
// Organizer self-registration with invite code
router.post('/register-organizer', async (req, res) => {
  try {
    const { email, password, name, phone, city, inviteCode } = req.body;

    if (inviteCode !== process.env.ORGANIZER_INVITE_CODE) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, name required' });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({ email, password, displayName: name });

    // Set custom claim: role = organizer
    await auth.setCustomUserClaims(userRecord.uid, { role: 'organizer' });

    // Save organizer profile to Firestore
    await db.collection('organizers').doc(userRecord.uid).set({
      uid: userRecord.uid, name, email, phone: phone || '',
      city: city || 'Ahmedabad', role: 'organizer',
      active: true, createdAt: new Date().toISOString(),
      eventIds: [],
    });

    res.json({ success: true, message: 'Organizer registered!', uid: userRecord.uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify  — verify token & get user profile
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded   = await auth.verifyIdToken(token);
    const orgDoc    = await db.collection('organizers').doc(decoded.uid).get();
    const profile   = orgDoc.exists ? orgDoc.data() : null;
    res.json({ uid: decoded.uid, role: decoded.role || 'user', profile });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/auth/organizers — superadmin: list all organizers
router.get('/organizers', async (req, res) => {
  try {
    const snap = await db.collection('organizers').orderBy('createdAt', 'desc').get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
