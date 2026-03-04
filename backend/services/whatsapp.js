// backend/services/whatsapp.js
const twilio = require('twilio');

function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function fmt(phone) {
  // Ensure +91 prefix
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('91') ? '+' + clean : '+91' + clean;
  return 'whatsapp:' + num;
}

// ── Customer Booking Confirmation ────────────────────────────
async function sendCustomerWhatsApp({ phone, name, ticketId, eventName, passName, amount }) {
  const msg = `🪔 *GarbaUtsav — Booking Confirmed!*

Namaste *${name}*! 🎉

Aapki booking successful rahi.

🎟 *Ticket ID:* ${ticketId}
🎪 *Event:* ${eventName}
🏅 *Pass:* ${passName}
💰 *Amount:* ₹${amount}

Gate pe yeh Ticket ID ya email ka QR code dikhao.

Jai Mataji! 🙏
_GarbaUtsav Events Pvt Ltd, Ahmedabad_`;

  try {
    await getClient().messages.create({
      body: msg,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   fmt(phone),
    });
    console.log(`✅ WhatsApp sent to customer: ${phone}`);
  } catch (err) {
    console.error('WhatsApp customer error:', err.message);
  }
}

// ── Organizer New Booking Alert ───────────────────────────────
async function sendOrganizerWhatsApp({ name, phone, eventName, passName, amount, ticketId }) {
  const msg = `💰 *New Booking Alert — GarbaUtsav*

🎟 *ID:* ${ticketId}
👤 *Buyer:* ${name} (${phone})
🎪 *Event:* ${eventName}
🏅 *Pass:* ${passName}
💵 *Amount:* ₹${amount}
🕐 *Time:* ${new Date().toLocaleString('en-IN')}

Admin panel check karein: garbautsav.in/admin`;

  try {
    await getClient().messages.create({
      body: msg,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   'whatsapp:' + process.env.ORGANIZER_WHATSAPP,
    });
    console.log('✅ WhatsApp sent to organizer');
  } catch (err) {
    console.error('WhatsApp organizer error:', err.message);
  }
}

module.exports = { sendCustomerWhatsApp, sendOrganizerWhatsApp };
