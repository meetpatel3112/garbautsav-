// ============================================================
// seed.js — Firebase mein sample data daalo
// Run: node seed.js
// ============================================================
const admin = require("firebase-admin");
const crypto = require("crypto");
require("dotenv").config();

const serviceAccount = require("./firebase-service-account.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function hash(p) { return crypto.createHash("sha256").update(p).digest("hex"); }

async function seed() {
  console.log("🌱 Seeding Firebase...");

  // ── 1. Super Admin ────────────────────────────────────
  await db.collection("organizers").doc("superadmin").set({
    name: "GarbaUtsav Admin", email: "admin@garbautsav.in",
    password: hash("Admin@2025"), phone: "+919876543210",
    city: "Ahmedabad", role: "superadmin", active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("✅ Super admin created");

  // ── 2. Sample Organizers ──────────────────────────────
  const orgs = [
    { id:"org1", name:"Shree Ram Cultural Club", email:"shreeramclub@gmail.com", password:hash("Ram@2025"), phone:"+919898001001", city:"Ahmedabad" },
    { id:"org2", name:"Patel Cultural Society", email:"patelcs@gmail.com",       password:hash("Patel@2025"), phone:"+919898002002", city:"Surat" },
    { id:"org3", name:"Vadodara Navratri Samiti", email:"vnsamiti@gmail.com",    password:hash("Vada@2025"), phone:"+919898003003", city:"Vadodara" },
  ];
  for (const o of orgs) {
    await db.collection("organizers").doc(o.id).set({ ...o, role:"organizer", active:true, createdAt:admin.firestore.FieldValue.serverTimestamp() });
  }
  console.log("✅ Organizers created");

  // ── 3. Pass Types ─────────────────────────────────────
  const passes = [
    { id:"silver",  name:"Silver Entry",  icon:"🎫", basePrice:199, color:"silver",  features:["Single entry","All 9 nights","Basic seating","Parking","Digital QR pass"] },
    { id:"gold",    name:"Gold Pass",     icon:"🏅", basePrice:349, color:"gold",    popular:true, features:["Single entry","All 9 nights","Premium seating","Snacks","VIP Parking","Digital QR"] },
    { id:"premium", name:"Premium VIP",   icon:"💎", basePrice:599, color:"premium", features:["Single entry","All 9 nights","VIP Lounge","Full Dinner","Dedicated Parking","Gift Hamper","Physical+Digital Pass"] },
    { id:"couple",  name:"Couple Pass",   icon:"💑", basePrice:649, color:"couple",  features:["2 persons entry","All 9 nights","Couple seating","Welcome drinks","Photo session","Parking","Digital QR"] },
  ];
  for (const p of passes) {
    await db.collection("passTypes").doc(p.id).set(p);
  }
  console.log("✅ Pass types created");

  // ── 4. Events ─────────────────────────────────────────
  const events = [
    { organizerId:"org1", organizerEmail:"shreeramclub@gmail.com", name:"Navratri Mahotsav 2025",       location:"GMDC Grounds, Ahmedabad",      city:"Ahmedabad", date:"2–11 Oct 2025", time:"8:00 PM – 1:00 AM", totalPasses:500, soldPasses:180, basePrice:299, theme:"saffron", emoji:"💃", featured:true,  active:true, revenue:0 },
    { organizerId:"org2", organizerEmail:"patelcs@gmail.com",       name:"Royal Garba Night",            location:"Sports Complex, Surat",        city:"Surat",     date:"3–12 Oct 2025", time:"7:30 PM – 12:30 AM",totalPasses:400, soldPasses:110, basePrice:349, theme:"gold",    emoji:"🪔", featured:false, active:true, revenue:0 },
    { organizerId:"org3", organizerEmail:"vnsamiti@gmail.com",      name:"Heritage Garba Utsav",         location:"Sayaji Park, Vadodara",        city:"Vadodara",  date:"2–11 Oct 2025", time:"8:00 PM – 1:30 AM", totalPasses:600, soldPasses:200, basePrice:199, theme:"royal",   emoji:"🎶", featured:false, active:true, revenue:0 },
    { organizerId:"org1", organizerEmail:"shreeramclub@gmail.com", name:"Grand Navratri Celebration",   location:"Race Course Ground, Rajkot",   city:"Rajkot",    date:"4–13 Oct 2025", time:"8:30 PM – 1:00 AM", totalPasses:500, soldPasses:90,  basePrice:249, theme:"saffron", emoji:"🌟", featured:false, active:true, revenue:0 },
    { organizerId:"org2", organizerEmail:"patelcs@gmail.com",       name:"Falguni Pathak Nite 2025",     location:"Sector 7 Ground, Gandhinagar", city:"Gandhinagar",date:"5–14 Oct 2025",time:"9:00 PM – 2:00 AM", totalPasses:800, soldPasses:310, basePrice:399, theme:"gold",    emoji:"🎤", featured:true,  active:true, revenue:0 },
    { organizerId:"org3", organizerEmail:"vnsamiti@gmail.com",      name:"Dandiya Dhamaka Night",        location:"Town Hall, Anand",             city:"Anand",     date:"2–11 Oct 2025", time:"8:00 PM – 1:00 AM", totalPasses:350, soldPasses:60,  basePrice:149, theme:"royal",   emoji:"🎀", featured:false, active:true, revenue:0 },
    { organizerId:"org1", organizerEmail:"shreeramclub@gmail.com", name:"VIP Garba Gala 2025",          location:"Taj Convention, Surat",        city:"Surat",     date:"3–12 Oct 2025", time:"8:00 PM – 2:00 AM", totalPasses:200, soldPasses:45,  basePrice:599, theme:"saffron", emoji:"👑", featured:false, active:true, revenue:0 },
    { organizerId:"org2", organizerEmail:"patelcs@gmail.com",       name:"Family Navratri Mela",         location:"Exhibition Ground, Mehsana",   city:"Mehsana",   date:"2–11 Oct 2025", time:"7:00 PM – 12:00 AM",totalPasses:700, soldPasses:220, basePrice:179, theme:"gold",    emoji:"🎠", featured:false, active:true, revenue:0 },
    { organizerId:"org3", organizerEmail:"vnsamiti@gmail.com",      name:"Navratri Beats — EDM Garba",  location:"ITC Narmada Lawns, Ahmedabad", city:"Ahmedabad", date:"6–15 Oct 2025", time:"9:00 PM – 3:00 AM", totalPasses:300, soldPasses:120, basePrice:499, theme:"royal",   emoji:"🎧", featured:false, active:true, revenue:0 },
    { organizerId:"org1", organizerEmail:"shreeramclub@gmail.com", name:"Garba Under The Stars 2025",  location:"Riverfront, Ahmedabad",        city:"Ahmedabad", date:"2–11 Oct 2025", time:"8:30 PM – 1:30 AM", totalPasses:450, soldPasses:180, basePrice:329, theme:"saffron", emoji:"⭐", featured:false, active:true, revenue:0 },
  ];
  for (const e of events) {
    await db.collection("events").add({ ...e, createdAt:admin.firestore.FieldValue.serverTimestamp() });
  }
  console.log("✅ 10 Events created");

  // ── 5. Coupons ────────────────────────────────────────
  const coupons = [
    { code:"GARBA10",  type:"percent", value:10, maxUses:500, usedCount:0, expiryDate:"2025-10-31", active:true, label:"10% OFF" },
    { code:"NAVRATRI", type:"percent", value:15, maxUses:300, usedCount:0, expiryDate:"2025-10-31", active:true, label:"15% OFF" },
    { code:"WELCOME50",type:"flat",    value:50, maxUses:200, usedCount:0, expiryDate:"2025-10-31", active:true, label:"₹50 OFF" },
    { code:"COUPLE99", type:"flat",    value:99, maxUses:150, usedCount:0, expiryDate:"2025-10-31", active:true, label:"₹99 OFF" },
    { code:"VIP20",    type:"percent", value:20, maxUses:100, usedCount:0, expiryDate:"2025-10-31", active:true, label:"20% OFF" },
    { code:"FIRSTBUY", type:"flat",    value:30, maxUses:1000,usedCount:0, expiryDate:"2025-12-31", active:true, label:"₹30 OFF" },
  ];
  for (const c of coupons) {
    await db.collection("coupons").doc(c.code).set({ ...c, organizerId:"global", createdAt:admin.firestore.FieldValue.serverTimestamp() });
  }
  console.log("✅ Coupons created");

  console.log("\n🎉 Seeding complete! Firebase ready.\n");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
