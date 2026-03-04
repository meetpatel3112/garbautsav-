// backend/routes/admin.js
const router = require('express').Router();
const { db } = require('../services/firebase');

// GET /api/admin/sales?eventId=&status=&limit=
router.get('/sales', async (req, res) => {
  try {
    const { eventId, status, limit = 100 } = req.query;
    let q = db.collection('bookings').orderBy('createdAt', 'desc').limit(Number(limit));
    if (eventId) q = q.where('eventId', '==', eventId);
    if (status)  q = q.where('status',  '==', status);
    const snap = await q.get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats — overall KPIs
router.get('/stats', async (req, res) => {
  try {
    const [bookSnap, evSnap] = await Promise.all([
      db.collection('bookings').where('status', '==', 'confirmed').get(),
      db.collection('events').where('active', '==', true).get(),
    ]);

    let revenue = 0, tickets = 0, discounts = 0;
    const byPass = {};
    const byEvent = {};
    const daily = {};

    bookSnap.docs.forEach(d => {
      const b = d.data();
      revenue   += Number(b.amount  || 0);
      tickets   += Number(b.qty     || 0);
      discounts += Number(b.discount || 0);

      // Pass breakdown
      byPass[b.passName] = (byPass[b.passName] || 0) + Number(b.amount);
      // Event breakdown
      byEvent[b.eventName] = (byEvent[b.eventName] || { revenue: 0, tickets: 0 });
      byEvent[b.eventName].revenue += Number(b.amount);
      byEvent[b.eventName].tickets += Number(b.qty);
      // Daily
      const day = b.createdAt?.slice(0, 10) || 'unknown';
      daily[day] = (daily[day] || 0) + Number(b.amount);
    });

    const expenses = Math.round(revenue * 0.55); // 55% estimated expense
    const profit   = revenue - expenses;

    res.json({
      revenue, tickets, discounts,
      expenses, profit,
      profitMargin: revenue ? Math.round((profit / revenue) * 100) : 0,
      totalBookings: bookSnap.size,
      activeEvents: evSnap.size,
      byPass, byEvent,
      dailyRevenue: daily,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/pnl — Profit & Loss per event
router.get('/pnl', async (req, res) => {
  try {
    const evSnap = await db.collection('events').get();
    const result = [];

    for (const evDoc of evSnap.docs) {
      const ev = evDoc.data();
      const bSnap = await db.collection('bookings')
        .where('eventId', '==', evDoc.id)
        .where('status', '==', 'confirmed')
        .get();

      let revenue = 0, tickets = 0;
      bSnap.docs.forEach(d => { revenue += Number(d.data().amount || 0); tickets += Number(d.data().qty || 0); });

      const expenses = Math.round(revenue * 0.55);
      const profit   = revenue - expenses;

      result.push({
        eventId: evDoc.id, eventName: ev.name, city: ev.city,
        revenue, tickets, expenses, profit,
        margin: revenue ? Math.round((profit / revenue) * 100) : 0,
        totalPasses: ev.totalPasses, soldPasses: ev.soldPasses || 0,
        occupancy: ev.totalPasses ? Math.round(((ev.soldPasses || 0) / ev.totalPasses) * 100) : 0,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/booking/:id/status
router.patch('/booking/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('bookings').doc(req.params.id).update({ status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
