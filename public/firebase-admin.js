// GarbaUtsav Firebase Admin — Admin Panel
// Yeh file admin.html mein automatically kaam karegi
const FB_ADMIN = "https://garbautsav-898e2-default-rtdb.firebaseio.com";

// Firebase mein save karo
async function fbSave() {
  if (!window.evs || !window.pss || !window.css_) return;
  try {
    const data = {
      events:   {},
      passes:   {},
      costumes: {}
    };
    evs.forEach(e  => { data.events[e.id.replace(/[^a-z0-9]/gi,'_')]   = e;  });
    pss.forEach(p  => { data.passes[p.id.replace(/[^a-z0-9]/gi,'_')]   = p;  });
    css_.forEach(c => { data.costumes[c.id.replace(/[^a-z0-9]/gi,'_')] = c;  });
    
    await fetch(FB_ADMIN + '/data.json', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    console.log('✅ Firebase saved!');
    if (typeof showToast === 'function') showToast('✅ Saved! Main website pe bhi update ho gaya!');
  } catch(e) {
    console.warn('Firebase save failed:', e.message);
  }
}

// Firebase se load karo
async function fbLoad() {
  try {
    const r = await fetch(FB_ADMIN + '/data.json');
    if (!r.ok) return false;
    const d = await r.json();
    if (!d) return false;
    
    if (d.events && Object.keys(d.events).length > 0) {
      window.evs = Object.values(d.events).filter(e => e && e.name);
    }
    if (d.passes && Object.keys(d.passes).length > 0) {
      window.pss = Object.values(d.passes).filter(p => p && p.name);
    }
    if (d.costumes && Object.keys(d.costumes).length > 0) {
      window.css_ = Object.values(d.costumes).filter(c => c && c.name);
    }
    return true;
  } catch(e) {
    return false;
  }
}

// Har save operation ke baad Firebase bhi update karo
// MutationObserver se detect karo kab data change hua
(function() {
  const origLsw = window.lsw;
  if (origLsw) {
    window.lsw = function(k, v) {
      origLsw(k, v);
      // Jab bhi events/passes/costumes save ho, Firebase bhi update karo
      if (k && (k.includes('events') || k.includes('passes') || k.includes('costumes'))) {
        setTimeout(fbSave, 100);
      }
    };
  }
})();
