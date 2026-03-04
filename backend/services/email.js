// backend/services/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ── Booking Confirmation to Customer ──────────────────────────
async function sendBookingConfirmation({ to, name, ticketId, eventName, passName, qty, amount, date, qrBase64 }) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8">
  <style>
    body{font-family:'Segoe UI',sans-serif;background:#FFF8EE;margin:0;padding:0}
    .container{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
    .header{background:linear-gradient(135deg,#FF6B00,#C0392B);padding:32px;text-align:center;color:white}
    .header h1{font-size:28px;margin:0 0 4px}
    .header p{margin:0;opacity:0.85;font-size:14px}
    .body{padding:28px}
    .ticket{background:#1A0A00;border-radius:14px;padding:20px;margin:20px 0;border:2px dashed rgba(240,165,0,0.4);text-align:center}
    .ticket .tid{color:#FFD166;font-size:22px;font-weight:900;letter-spacing:0.05em}
    .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
    .row:last-child{border:none}
    .label{color:#666}
    .value{font-weight:600;color:#1A0A00}
    .amount{color:#FF6B00;font-size:18px;font-weight:900}
    .qr-wrap{text-align:center;margin:20px 0}
    .qr-wrap img{width:150px;height:150px;border:3px solid #FF6B00;border-radius:12px;padding:6px}
    .footer{background:#FFF8EE;padding:20px;text-align:center;font-size:12px;color:#888}
    .btn{display:inline-block;background:linear-gradient(135deg,#FF6B00,#C0392B);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;margin:16px 0}
  </style>
  </head>
  <body>
  <div class="container">
    <div class="header">
      <h1>🪔 GarbaUtsav</h1>
      <p>Booking Confirmed! Aapka pass ready hai.</p>
    </div>
    <div class="body">
      <p style="font-size:16px">Namaste <strong>${name}</strong>! 🎉</p>
      <p style="color:#666;font-size:14px">Aapki booking confirm ho gayi hai. Neeche aapka e-pass aur details hain:</p>

      <div class="ticket">
        <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:6px">TICKET ID</div>
        <div class="tid">${ticketId}</div>
      </div>

      ${qrBase64 ? `<div class="qr-wrap"><img src="cid:qrcode" alt="QR Code"/><p style="font-size:12px;color:#888;margin-top:8px">Gate pe yeh QR scan karein</p></div>` : ''}

      <div class="row"><span class="label">Event</span><span class="value">${eventName}</span></div>
      <div class="row"><span class="label">Pass Type</span><span class="value">${passName} × ${qty}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${date}</span></div>
      <div class="row"><span class="label">Amount Paid</span><span class="amount">₹${amount}</span></div>
      <div class="row"><span class="label">Status</span><span class="value" style="color:#27AE60">✓ Confirmed</span></div>

      <div style="text-align:center;margin-top:24px">
        <p style="font-size:13px;color:#666">PDF ticket alag attachment mein bheja gaya hai.<br>Gate pe QR code ya Ticket ID dikhao.</p>
      </div>
    </div>
    <div class="footer">
      GarbaUtsav Events Pvt Ltd • Ahmedabad, Gujarat<br>
      Support: ${process.env.ORGANIZER_EMAIL} | WhatsApp: ${process.env.ORGANIZER_WHATSAPP}
    </div>
  </div>
  </body></html>`;

  const mailOptions = {
    from: `"GarbaUtsav 🪔" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎟 Booking Confirmed! ${ticketId} — ${eventName}`,
    html,
    attachments: qrBase64 ? [{
      filename: 'qr-code.png',
      content: qrBase64.split('base64,')[1],
      encoding: 'base64',
      cid: 'qrcode',
    }] : [],
  };

  return transporter.sendMail(mailOptions);
}

// ── New Booking Alert to Organizer ───────────────────────────
async function sendOrganizerAlert({ eventName, passName, buyerName, buyerPhone, amount, ticketId }) {
  const html = `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:2px solid #FF6B00">
    <h2 style="color:#FF6B00;margin-bottom:4px">🎟 New Booking Alert!</h2>
    <p style="color:#666;font-size:14px">GarbaUtsav mein ek nayi booking aayi hai</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Ticket ID</td><td style="font-weight:700">${ticketId}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Event</td><td style="font-weight:700">${eventName}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Pass</td><td style="font-weight:700">${passName}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Buyer</td><td style="font-weight:700">${buyerName}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Phone</td><td style="font-weight:700">${buyerPhone}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px">Amount</td><td style="font-weight:700;color:#FF6B00;font-size:18px">₹${amount}</td></tr>
    </table>
  </div>`;

  return transporter.sendMail({
    from: `"GarbaUtsav System" <${process.env.EMAIL_USER}>`,
    to: process.env.ORGANIZER_EMAIL,
    subject: `💰 New Booking: ₹${amount} — ${buyerName} — ${ticketId}`,
    html,
  });
}

module.exports = { sendBookingConfirmation, sendOrganizerAlert };
