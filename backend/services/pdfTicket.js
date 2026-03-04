// backend/services/pdfTicket.js
const PDFDocument = require('pdfkit');
const QRCode      = require('qrcode');

async function generateTicketPDF({ ticketId, name, phone, email, eventName, eventDate, eventLocation, passName, qty, amount, coupon, discount, paymentId }) {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code as base64
      const qrData   = JSON.stringify({ ticketId, event: eventName, pass: passName, name });
      const qrBase64 = await QRCode.toDataURL(qrData, { width: 200, margin: 1, color: { dark: '#1A0A00', light: '#FFFFFF' } });
      const qrBuffer = Buffer.from(qrBase64.split('base64,')[1], 'base64');

      const doc    = new PDFDocument({ size: [595, 842], margin: 0 });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end',  () => resolve({ pdf: Buffer.concat(chunks), qrBase64 }));

      // ── Background ─────────────────────────────────────────
      doc.rect(0, 0, 595, 842).fill('#FFF8EE');

      // ── Header band ────────────────────────────────────────
      doc.rect(0, 0, 595, 180).fill('#1A0A00');

      // ── Decorative circles ──────────────────────────────────
      doc.circle(520, 30, 80).fillOpacity(0.06).fill('#FF6B00');
      doc.circle(80, 160, 60).fillOpacity(0.06).fill('#F0A500');
      doc.fillOpacity(1);

      // ── Header text ────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(28).fillColor('#F0A500').text('GarbaUtsav', 40, 40);
      doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.6)').text('GarbaUtsav Events Pvt Ltd • Ahmedabad, Gujarat', 40, 75);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('white').text('E-TICKET / ENTRY PASS', 40, 105);

      // ── Divider ─────────────────────────────────────────────
      doc.moveTo(40, 130).lineTo(555, 130).strokeColor('rgba(240,165,0,0.3)').lineWidth(1).stroke();

      // ── Event name ─────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#FFD166').text(eventName, 40, 142, { width: 400 });

      // ── Ticket ID badge ─────────────────────────────────────
      doc.rect(40, 200, 515, 64).radius(12).fill('#1A0A00');
      doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.5)').text('TICKET ID', 60, 210);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFD166').text(ticketId, 60, 228);
      doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.5)').text('SCAN AT GATE', 430, 210, { align: 'right', width: 110 });

      // ── QR Code ─────────────────────────────────────────────
      doc.image(qrBuffer, 415, 275, { width: 150, height: 150 });
      doc.font('Helvetica').fontSize(10).fillColor('#888').text('Scan for Entry', 415, 432, { width: 150, align: 'center' });

      // ── Details rows ────────────────────────────────────────
      const rows = [
        ['👤 Name',       name],
        ['📱 Phone',      phone],
        ['📧 Email',      email],
        ['📅 Event Date', eventDate],
        ['📍 Location',   eventLocation],
        ['🏅 Pass Type',  `${passName} × ${qty}`],
        ['💳 Payment ID', paymentId || 'Demo'],
        coupon ? ['🏷️ Coupon Used', `${coupon} (−₹${discount})`] : null,
      ].filter(Boolean);

      let y = 280;
      rows.forEach(([label, value]) => {
        doc.font('Helvetica').fontSize(10).fillColor('#888').text(label, 60, y);
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1A0A00').text(value, 200, y, { width: 200 });
        doc.moveTo(60, y + 18).lineTo(395, y + 18).strokeColor('#F0E8D8').lineWidth(0.5).stroke();
        y += 26;
      });

      // ── Amount ──────────────────────────────────────────────
      y += 8;
      doc.rect(60, y, 335, 50).radius(10).fill('#FF6B00');
      doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.75)').text('Amount Paid', 80, y + 8);
      doc.font('Helvetica-Bold').fontSize(22).fillColor('white').text(`₹${amount}`, 80, y + 22);

      // ── Dashed cut line ──────────────────────────────────────
      const cutY = 500;
      doc.moveTo(40, cutY).lineTo(555, cutY).strokeColor('#ccc').lineWidth(1).dash(6, { space: 4 }).stroke();
      doc.undash();
      doc.font('Helvetica').fontSize(9).fillColor('#bbb').text('✂  Cut here — Venue Entry Stub', 220, cutY + 4);

      // ── Bottom stub ──────────────────────────────────────────
      doc.rect(40, 520, 515, 100).radius(12).fill('#1A0A00');
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFD166').text(eventName, 60, 535, { width: 390 });
      doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.7)').text(`${passName} • ${name}`, 60, 558);
      doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.7)').text(`📅 ${eventDate}`, 60, 578);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFD166').text(ticketId, 60, 598);

      // ── Footer ──────────────────────────────────────────────
      doc.rect(0, 780, 595, 62).fill('#1A0A00');
      doc.font('Helvetica').fontSize(10).fillColor('rgba(255,255,255,0.5)')
        .text('GarbaUtsav Events Pvt Ltd | Ahmedabad, Gujarat | This is a valid e-ticket', 40, 798, { align: 'center', width: 515 });
      doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.3)')
        .text('Non-transferable • Valid for listed event dates only', 40, 815, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTicketPDF };
