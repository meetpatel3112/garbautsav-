# 🪔 GarbaUtsav — Complete Setup Guide
## GarbaUtsav Events Pvt Ltd | Ahmedabad, Gujarat

---

## 📁 Project Structure

```
garbautsav/
├── public/
│   ├── index.html          ← Main user website (frontend)
│   └── admin.html          ← Admin panel (multi-organizer)
├── backend/
│   ├── server.js           ← Express server (entry point)
│   ├── routes/
│   │   ├── auth.js         ← Login, register organizer
│   │   ├── events.js       ← CRUD events
│   │   ├── payment.js      ← Razorpay order + verify
│   │   ├── booking.js      ← Confirm booking, send notifications
│   │   ├── ticket.js       ← PDF download, QR verify
│   │   └── admin.js        ← Sales, stats, P&L
│   ├── services/
│   │   ├── firebase.js     ← Firestore database
│   │   ├── email.js        ← Gmail booking confirmation
│   │   ├── whatsapp.js     ← Twilio WhatsApp notifications
│   │   └── pdfTicket.js    ← PDF ticket with QR code
│   └── middleware/
│       └── auth.js         ← Firebase token verification
├── .env.example            ← Copy to .env and fill values
├── package.json
└── README.md               ← This file
```

---

## 🚀 STEP-BY-STEP LAUNCH GUIDE

### STEP 1 — Install Node.js
1. Go to https://nodejs.org
2. Download LTS version (v20+)
3. Install it

### STEP 2 — Setup Project
```bash
# In your project folder:
npm install

# Copy env file:
cp .env.example .env
```

---

### STEP 3 — Setup Firebase (FREE)
1. Go to https://firebase.google.com
2. Click "Add project" → Name: `garbautsav`
3. Go to **Firestore Database** → Create database (production mode)
4. Go to **Project Settings** → **Service Accounts** → "Generate new private key"
5. Open the downloaded JSON file and copy:
   - `project_id` → FIREBASE_PROJECT_ID in .env
   - `private_key` → FIREBASE_PRIVATE_KEY in .env
   - `client_email` → FIREBASE_CLIENT_EMAIL in .env
6. Also go to **Project Settings** → **General** → Copy `apiKey`, `authDomain`, `projectId`
7. Paste them in `admin.html` inside `FB_CONFIG = { ... }`

**Firestore Collections needed (auto-created):**
- `events` — event data
- `bookings` — all ticket bookings
- `organizers` — organizer profiles
- `payments` — payment records

---

### STEP 4 — Setup Razorpay (FREE, 2% per transaction)
1. Go to https://razorpay.com → Sign Up
2. Complete KYC (PAN + Aadhaar + Bank account) — takes 2-3 days
3. Dashboard → Settings → API Keys → Generate Test Key first
4. Copy `Key ID` → RAZORPAY_KEY_ID in .env
5. Copy `Key Secret` → RAZORPAY_KEY_SECRET in .env
6. **For testing:** Use test keys (no real money)
7. **For live:** Switch to live keys after KYC approval

**Test card:** 4111 1111 1111 1111 | Expiry: any future | CVV: any

---

### STEP 5 — Setup Gmail Email (FREE)
1. Use/create a Gmail: e.g. garbautsav2025@gmail.com
2. Go to: Google Account → Security → 2-Step Verification → Turn ON
3. Then: Security → App Passwords → Select "Mail" → Generate
4. Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)
5. Paste in .env:
   - EMAIL_USER=garbautsav2025@gmail.com
   - EMAIL_APP_PASSWORD=abcd efgh ijkl mnop

---

### STEP 6 — Setup WhatsApp via Twilio (FREE Trial)
1. Go to https://twilio.com → Sign Up (FREE $15 credit)
2. Get your:
   - TWILIO_ACCOUNT_SID (starts with AC...)
   - TWILIO_AUTH_TOKEN
3. Go to Twilio Console → Messaging → Try WhatsApp
4. Follow sandbox instructions (send "join <word>" to their number)
5. Fill in .env:
   - TWILIO_ACCOUNT_SID=ACxxxxxxx
   - TWILIO_AUTH_TOKEN=xxxxxxx
   - TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   - ORGANIZER_WHATSAPP=+91XXXXXXXXXX (your number)

**Cost after free trial:** ~₹0.40 per WhatsApp message

---

### STEP 7 — Fill Remaining .env Values
```env
PORT=3000
FRONTEND_URL=https://your-domain.com
ORGANIZER_INVITE_CODE=GARBA2025ORG   ← Organizers need this to register
ORGANIZER_EMAIL=garbautsav2025@gmail.com
ORGANIZER_WHATSAPP=+91XXXXXXXXXX
COMPANY_NAME=GarbaUtsav Events Pvt Ltd
COMPANY_CITY=Ahmedabad, Gujarat
```

---

### STEP 8 — Test Locally
```bash
npm run dev
# Opens at: http://localhost:3000
# Admin at:  http://localhost:3000/admin.html
# Demo login: admin@garbautsav.com / admin123
```

---

## 🌐 DEPLOYMENT (Cheapest Options)

### Option A — Render.com (FREE for backend)
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `node backend/server.js`
6. Add all .env variables in Render dashboard
7. Deploy! You get a free URL like: `garbautsav.onrender.com`

### Option B — Railway.app (~₹500/month)
1. https://railway.app → Deploy from GitHub
2. Add environment variables
3. Deploy — very fast and reliable

### Option C — DigitalOcean App Platform (~₹700/month)
1. https://digitalocean.com → App Platform
2. Connect GitHub → Deploy

### 🌐 Custom Domain (₹99/year)
1. Buy `garbautsav.in` from Hostinger (₹99/year)
2. In Render/Railway dashboard → Add custom domain
3. Update DNS settings as instructed
4. SSL is FREE and automatic ✅

---

## 💰 Total Monthly Cost After Launch

| Service | Cost |
|---------|------|
| Hosting (Render free tier) | ₹0 |
| Firebase (free tier: 1GB, 50k reads/day) | ₹0 |
| Domain (garbautsav.in) | ₹8/month (~₹99/year) |
| Razorpay (2% per sale) | Per transaction only |
| Gmail emails | ₹0 |
| Twilio WhatsApp | ~₹0.40/message |
| **Total fixed** | **₹8/month** |

---

## 🔑 Admin Panel Login

**Demo / First Login:**
- Email: `admin@garbautsav.com`
- Password: `admin123`

**After Firebase setup:**
- Create real admin account in Firebase Auth
- Set custom claim: `role: "superadmin"`

**Organizer Registration:**
- Share `ORGANIZER_INVITE_CODE` with organizers
- They register at `/admin.html` → Register tab

---

## 📱 Features Summary

### User Website (index.html)
- ✅ 8+ events displayed with city filter
- ✅ 4 pass types per event
- ✅ Coupon codes (GARBA10, NAVRATRI, etc.)
- ✅ Razorpay payment (real + demo mode)
- ✅ Email confirmation with PDF ticket
- ✅ WhatsApp notification
- ✅ Digital e-pass with QR code
- ✅ PDF download

### Admin Panel (admin.html)
- ✅ Multi-organizer login (Firebase Auth)
- ✅ Dashboard with Revenue, P&L, Charts
- ✅ Sales table with search/filter/export CSV
- ✅ Profit & Loss statement
- ✅ Per-event revenue breakdown
- ✅ Event CRUD (add/edit/delete)
- ✅ Pass type management
- ✅ User access control with toggles
- ✅ Check-in gate manager
- ✅ Analytics & day-wise charts

---

## 🆘 Need Help?

Common Issues:
1. **Email not sending** → Check Gmail App Password (not regular password)
2. **WhatsApp not working** → Join Twilio sandbox first
3. **Razorpay error** → Check Key ID/Secret match
4. **Firebase error** → Check private key has `\n` replaced correctly

---

*GarbaUtsav Events Pvt Ltd | Ahmedabad, Gujarat | Jai Mataji 🙏*
