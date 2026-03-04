// backend/routes/payment.js
const router   = require('express').Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const { db }   = require('../services/firebase');

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Called before showing Razorpay popup
router.post('/create-order', async (req, res) => {
  try {
    const { amount, eventId, passId, qty, buyerName, buyerEmail, buyerPhone, coupon } = req.body;

    if (!amount || !eventId || !passId) {
      return res.status(400).json({ error: 'amount, eventId, passId required' });
    }

    // Verify event exists and has passes left
    const evDoc = await db.collection('events').doc(eventId).get();
    if (!evDoc.exists) return res.status(404).json({ error: 'Event not found' });
    const ev = evDoc.data();
    if (ev.soldPasses + qty > ev.totalPasses) {
      return res.status(400).json({ error: 'Not enough passes available' });
    }

    // Create Razorpay order
    const order = await rzp.orders.create({
      amount:   Math.round(amount * 100),  // paise
      currency: 'INR',
      receipt:  'GU_' + Date.now(),
      notes:    { eventId, passId, qty: String(qty), buyerName, buyerEmail, buyerPhone, coupon: coupon || '' },
    });

    res.json({
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/verify
// Called after Razorpay payment success callback
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // HMAC verification — prevent fraud
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — signature mismatch' });
    }

    // Mark payment as verified in Firestore
    await db.collection('payments').doc(razorpay_payment_id).set({
      orderId:   razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      verified:  true,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payment/key — get public Razorpay key
router.get('/key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
