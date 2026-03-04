// backend/routes/ticket.js
const router = require('express').Router();
const { db } = require('../services/firebase');
const { generateTicketPDF } = require('../services/pdfTicket');

// GET /api/ticket/download/:ticketId — download PDF ticket
router.get('/download/:ticketId', async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.ticketId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Ticket not found' });
    const b = doc.data();

    const { pdf } = await generateTicketPDF({
      ticketId:      b.ticketId,
      name:          b.buyerName,
      phone:         b.buyerPhone,
      email:         b.buyerEmail,
      eventName:     b.eventName,
      eventDate:     b.eventDate,
      eventLocation: b.eventLocation,
      passName:      b.passName,
      qty:           b.qty,
      amount:        b.amount,
      coupon:        b.coupon,
      discount:      b.discount,
      paymentId:     b.paymentId,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=GarbaUtsav-${b.ticketId}.pdf`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ticket/verify/:ticketId — verify ticket (for gate QR scan)
router.get('/verify/:ticketId', async (req, res) => {
  try {
    const doc = await db.collection('bookings').doc(req.params.ticketId).get();
    if (!doc.exists) return res.json({ valid: false, error: 'Not found' });
    const b = doc.data();
    res.json({
      valid:     b.status === 'confirmed',
      checkedIn: b.checkedIn || false,
      booking:   { ticketId: b.ticketId, name: b.buyerName, pass: b.passName, event: b.eventName, qty: b.qty },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
