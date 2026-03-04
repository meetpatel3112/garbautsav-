require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/events',  require('./routes/events'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/ticket',  require('./routes/ticket'));
app.use('/api/admin',   require('./routes/admin'));

app.get('/admin*', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('*',       (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🪔 GarbaUtsav running at http://localhost:${PORT}`);
});
