// WhatsApp Service — Safe fallback if Twilio not configured
let twilioClient = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_sid' &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_token') {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ WhatsApp (Twilio) connected');
  } else {
    console.log('⚠️ WhatsApp not configured — skipping (optional)');
  }
} catch (err) {
  console.log('⚠️ WhatsApp service not available:', err.message);
}

async function sendBookingConfirmation(phone, data) {
  if (!twilioClient) return { success: false, reason: 'WhatsApp not configured' };
  try {
    const msg = `🎉 *GarbaUtsav Booking Confirmed!*\n\nNameaste ${data.name}!\n\nYour pass is confirmed ✅\n\n🎫 *Ticket ID:* ${data.ticketId}\n🪔 *Event:* ${data.eventName}\n🎟 *Pass:* ${data.passName}\n👥 *Qty:* ${data.qty}\n💰 *Amount:* ₹${data.amount}\n\nEntry pe QR code scan hoga. PDF ticket email pe bhi bheja gaya hai!\n\n*Jai Mataji! 🙏*`;
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:+91${phone}`,
      body: msg
    });
    return { success: true };
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendOrganizerAlert(data) {
  if (!twilioClient) return { success: false, reason: 'WhatsApp not configured' };
  try {
    const msg = `🔔 *New Booking Alert!*\n\n👤 ${data.buyerName}\n📱 ${data.buyerPhone}\n🎟 ${data.passName} × ${data.qty}\n💰 ₹${data.amount}\n🪔 ${data.eventName}\n\nAdmin panel mein dekho!`;
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to: `whatsapp:${process.env.ORGANIZER_WHATSAPP || '+919876543210'}`,
      body: msg
    });
    return { success: true };
  } catch (err) {
    console.error('WhatsApp organizer alert error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendBookingConfirmation, sendOrganizerAlert };
