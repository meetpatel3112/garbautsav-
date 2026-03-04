// backend/routes/booking.js
const router  = require('express').Router();
const { db }  = require('../services/firebase');
const { v4: uuid } = require('uuid');
const { generateTicketPDF }       = require('../services/pdfTicket');
const { sendBookingConfirmation, sendOrganizerAlert } = require('../services/email');
const { sendCustomerWhatsApp, sendOrganizerWhatsApp } = require('../services/whatsapp');
const admin = require('firebase-admin');

// POST /api/booking/confirm
// Called after payment verified — creates booking + sends notifications
router.post('/confirm', async (req, res) => {
  try {
    const {
      paymentId, orderId,
      eventId, passId, qty,
      buyerName, buyerEmail, buyerPhone,
      coupon, discount, finalAmount,
    } = req.body;

    // Fetch event
    const evRef  = db.collection('events').doc(eventId);
    const evDoc  = await evRef.get();
    if (!evDoc.exists) return res.status(404).json({ error: 'Event not found' });
    const ev = evDoc.data();

    // Find pass details
    const pass = (ev.passes || []).find(p => p.id === passId) || { name: passId, icon: '🎟', price: 0 };

    // Generate unique ticket ID
    const ticketId = 'GU' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-3).toUpperCase();

    // Booking data
    const booking = {
      ticketId,
      paymentId:  paymentId || 'demo',
      orderId:    orderId   || '',
      eventId, eventName: ev.name,
      eventDate: `${ev.startDate} - ${ev.endDate}`,
      eventLocation: ev.location,
      passId, passName: pass.name, passIcon: pass.icon,
      qty:    Number(qty),
      buyerName, buyerEmail, buyerPhone,
      coupon:   coupon   || '',
      discount: Number(discount || 0),
      amount:   Number(finalAmount),
      status:   'confirmed',
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };

    // Save booking to Firestore
    await db.collection('bookings').doc(ticketId).set(booking);

    // Update event soldPasses count
    await evRef.update({
      soldPasses: admin.firestore.FieldValue.increment(Number(qty)),
    });

    // ── Generate PDF Ticket ──────────────────────────────────
    let pdfBuffer = null;
    let qrBase64  = null;
    try {
      const result = await generateTicketPDF({
        ticketId, name: buyerName, phone: buyerPhone, email: buyerEmail,
        eventName: ev.name, eventDate: `${ev.startDate} - ${ev.endDate}`,
        eventLocation: ev.location, passName: pass.name,
        qty: Number(qty), amount: Number(finalAmount),
        coupon: coupon || '', discount: Number(discount || 0),
        paymentId: paymentId || 'demo',
      });
      pdfBuffer = result.pdf;
      qrBase64  = result.qrBase64;
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr.message);
    }

    // ── Send Email to Customer ───────────────────────────────
    try {
      const mailOpts = {
        to: buyerEmail, name: buyerName, ticketId,
        eventName: ev.name, passName: pass.name,
        qty, amount: finalAmount,
        date: `${ev.startDate} - ${ev.endDate}`,
        qrBase64,
      };
      if (pdfBuffer) {
        mailOpts.attachments = [{
          filename: `GarbaUtsav-Ticket-${ticketId}.pdf`,
          content:  pdfBuffer,
        }];
      }
      await sendBookingConfirmation(mailOpts);
    } catch (e) { console.error('Email error:', e.message); }

    // ── Send Email to Organizer ──────────────────────────────
    try {
      await sendOrganizerAlert({
        eventName: ev.name, passName: pass.name,
        buyerName, buyerPhone, amount: finalAmount, ticketId,
      });
    } catch (e) { console.error('Organizer email error:', e.message); }

    // ── WhatsApp to Customer ─────────────────────────────────
    try {
      await sendCustomerWhatsApp({
        phone: buyerPhone, name: buyerName, ticketId,
        eventName: ev.name, passName: pass.name,
        amount: finalAmount,
      });
    } catch (e) { console.error('Customer WA error:', e.message); }

    // ── WhatsApp to Organizer ────────────────────────────────
    try {
      await sendOrganizerWhatsApp({
        name: buyerName, phone: buyerPhone,
        eventName: ev.name, passName: pass.name,
        amount: finalAmount, ticketId,
      });
    } catch (e) { console.error('Organizer WA error:', e.message); }

    res.json({ success: true, ticketId, booking });

  } catch (err) {
    console.error('Booking confirm error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/booking/:ticketId — get booking by ID
router.get('/:ticketId', async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.ticketId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Booking not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/booking/checkin/:ticketId — gate staff: check in
router.post('/checkin/:ticketId', async (req, res) => {
  try {
    const ref = db.collection('bookings').doc(req.params.ticketId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ valid: false, error: 'Ticket not found' });
    const b = doc.data();
    if (b.checkedIn) return res.json({ valid: false, error: 'Already checked in', booking: b });
    await ref.update({ checkedIn: true, checkinTime: new Date().toISOString() });
    res.json({ valid: true, booking: { ...b, checkedIn: true } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
