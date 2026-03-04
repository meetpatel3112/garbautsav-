// backend/routes/events.js
const router = require('express').Router();
const { db }  = require('../services/firebase');
const { requireOrganizer } = require('../middleware/auth');

// GET /api/events — public: list all active events
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('events')
      .where('active', '==', true)
      .orderBy('startDate', 'asc')
      .get();
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id — public: single event
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('events').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events — organizer: create event
router.post('/', requireOrganizer, async (req, res) => {
  try {
    const {
      name, organizer, location, city, startDate, endDate,
      time, totalPasses, theme, emoji, description,
      passes,   // array of pass types with prices
    } = req.body;

    if (!name || !location || !startDate || !totalPasses) {
      return res.status(400).json({ error: 'Required: name, location, startDate, totalPasses' });
    }

    const data = {
      name, organizer: organizer || req.user.name,
      organizerUid: req.user.uid,
      location, city: city || 'Ahmedabad',
      startDate, endDate: endDate || startDate,
      time: time || '8:00 PM - 1:00 AM',
      totalPasses: Number(totalPasses),
      soldPasses: 0,
      theme: theme || 'saffron',
      emoji: emoji || '💃',
      description: description || '',
      active: true,
      featured: false,
      passes: passes || [
        { id: 'silver',  name: 'Silver Entry', icon: '🎫', price: 199 },
        { id: 'gold',    name: 'Gold Pass',    icon: '🏅', price: 349 },
        { id: 'premium', name: 'Premium VIP',  icon: '💎', price: 599 },
        { id: 'couple',  name: 'Couple Pass',  icon: '💑', price: 649 },
      ],
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection('events').add(data);

    // Link event to organizer
    await db.collection('organizers').doc(req.user.uid).update({
      eventIds: require('firebase-admin').firestore.FieldValue.arrayUnion(ref.id),
    });

    res.json({ success: true, id: ref.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id — organizer: update event
router.put('/:id', requireOrganizer, async (req, res) => {
  try {
    const ref = db.collection('events').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    if (doc.data().organizerUid !== req.user.uid && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Not your event' });
    }
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    delete updates.soldPasses; // protect sold count
    await ref.update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id — organizer: soft delete
router.delete('/:id', requireOrganizer, async (req, res) => {
  try {
    await db.collection('events').doc(req.params.id).update({ active: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
