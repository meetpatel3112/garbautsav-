// GarbaUtsav Firebase Sync — Main Website
// Yeh file index.html mein automatically kaam karegi
(async function() {
  const FB = "https://garbautsav-898e2-default-rtdb.firebaseio.com";
  
  async function syncNow() {
    try {
      const r = await fetch(FB + '/data.json');
      const d = await r.json();
      if (!d) return;
      
      // Events sync
      if (d.events) {
        const evArr = Object.values(d.events).filter(e => e && e.name && e.active !== false);
        if (evArr.length > 0 && window.allEvents !== undefined) {
          window.allEvents = evArr;
          if (typeof renderCityTabs === 'function') renderCityTabs();
          if (typeof renderEvents === 'function') renderEvents('all');
        }
      }
      
      // Passes sync
      if (d.passes) {
        const psArr = Object.values(d.passes).filter(p => p && p.name);
        if (psArr.length > 0 && window.allPasses !== undefined) {
          window.allPasses = psArr.map(p => ({
            ...p,
            features: p.features || p.feats || [],
            popular: p.popular || p.pop || false
          }));
          if (typeof renderPasses === 'function') renderPasses();
        }
      }
      
      // Costumes sync
      if (d.costumes) {
        const csArr = Object.values(d.costumes).filter(c => c && c.name);
        if (csArr.length > 0 && window.allCostumes !== undefined) {
          window.allCostumes = csArr.map(c => ({
            ...c,
            emoji: c.emoji || c.em || '👗',
            colorClass: c.colorClass || c.cl || 'ci1',
            pricePerDay: c.pricePerDay || c.price || 0,
            deposit: c.deposit || c.dep || 0,
            available: c.available || c.avail || 0,
            tags: c.tags || []
          }));
          if (typeof renderCostumes === 'function') renderCostumes();
        }
      }
      
      console.log('✅ Firebase sync done!');
    } catch(e) {
      console.log('Firebase offline — local data use ho raha hai');
    }
  }
  
  // Page load pe sync karo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(syncNow, 500));
  } else {
    setTimeout(syncNow, 500);
  }
})();
