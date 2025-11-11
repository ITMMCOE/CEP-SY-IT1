// Core interactions: SW registration, theme, geolocation, emergency actions, logs, AI detection simulation
(function(){
  const DISABLE_SW_REG = true; // toggle during dev; true disables service worker registration for local debugging
  const supportsSW = 'serviceWorker' in navigator;
  if (!DISABLE_SW_REG && supportsSW) {
    navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered', reg)).catch(console.error);
  }

  // Safe localStorage helpers
  const storage = {
    get(key, fallback){ try{ const v = localStorage.getItem(key); return v?JSON.parse(v):fallback; }catch(e){return fallback} },
    set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  };

  // Theme
  const root = document.documentElement;
  const storedTheme = storage.get('theme','light');
  if(storedTheme==='dark') document.documentElement.setAttribute('data-theme','dark');
  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const now = document.documentElement.getAttribute('data-theme')==='dark' ? 'light':'dark';
      document.documentElement.setAttribute('data-theme', now==='dark'?'dark':'');
      storage.set('theme', now);
    });
  }

  // Log utilities
  function addLog(action, meta){
    const logs = storage.get('actionLogs',[]);
    const entry = {action, meta:meta||{}, ts: new Date().toISOString()};
    logs.unshift(entry);
    storage.set('actionLogs', logs.slice(0,200));
    renderLogs();
  }
  function renderLogs(){
    const list = document.getElementById('action-log'); if(!list) return;
    const logs = storage.get('actionLogs',[]);
    list.innerHTML = logs.map(l=>`<li><strong>${l.action}</strong> <span class="muted">${new Date(l.ts).toLocaleString()}</span><div class="meta">${l.meta.coords?`${l.meta.coords.lat.toFixed(4)}, ${l.meta.coords.lon.toFixed(4)}`:''}</div></li>`).join('');
    // update dashboard stat if present
    const stat = document.getElementById('stat-logs'); if(stat) stat.textContent = logs.length;
  }
  renderLogs();

  // Geolocation
  let lastPosition = null;
  function updateLocation(pos){
    lastPosition = {lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy};
    addLog('Location fetched', {coords:lastPosition});
    const alertEl = document.getElementById('alert-banner'); if(alertEl){ alertEl.textContent = `Location: ${lastPosition.lat.toFixed(5)}, ${lastPosition.lon.toFixed(5)}`; alertEl.classList.remove('hidden'); }
    // notify map
    if(window.EmergencyMap && typeof window.EmergencyMap.updateUserMarker === 'function'){
      window.EmergencyMap.updateUserMarker([lastPosition.lat, lastPosition.lon]);
    }
  }
  function handleGeolocationError(err){
    const el = document.getElementById('alert-banner'); if(el){ el.textContent = 'Geolocation error: ' + (err.message||err.code); el.classList.remove('hidden'); }
  }
  const locateBtn = document.getElementById('locate-me');
  if(locateBtn){
    locateBtn.addEventListener('click', ()=>{
      if(!navigator.geolocation) return handleGeolocationError({message:'Geolocation not supported'});
      navigator.geolocation.getCurrentPosition(updateLocation, handleGeolocationError, {enableHighAccuracy:true,timeout:8000});
    });
  }

  // (contacts and AI stats updated after AI setup below)

  // Emergency buttons
  document.querySelectorAll('.emergency-btn').forEach(btn=>{
    btn.addEventListener('click', (ev)=>{
      const num = btn.dataset.number || btn.getAttribute('href')?.replace('tel:','');
      addLog('Call', {number:num});
      // follow link if anchor, otherwise trigger tel
      if(btn.tagName.toLowerCase()==='a') return; // anchors handle navigation
      window.location.href = `tel:${num}`;
    });
  });

  const callAllBtn = document.getElementById('call-all');
  if(callAllBtn){
    callAllBtn.addEventListener('click', ()=>{
      const nums = Array.from(document.querySelectorAll('.emergency-btn')).map(b=> b.dataset.number || b.getAttribute('href')?.replace('tel:','')).join(', ');
      addLog('CallAll', {numbers:nums});
      alert('Calling all services: ' + nums + '\n(This demo will not actually place multiple calls.)');
    });
  }

  const shareBtn = document.getElementById('share-location');
  if(shareBtn){
    shareBtn.addEventListener('click', ()=>{
      if(!lastPosition) return alert('No location available — please use Locate Me first.');
      addLog('ShareLocation',{coords:lastPosition});
      // copy to clipboard
      const text = `My location: ${lastPosition.lat},${lastPosition.lon}`;
      navigator.clipboard?.writeText(text).then(()=>alert('Location copied to clipboard.')).catch(()=>alert(text));
    });
  }

  // AI detection simulation
  let aiEnabled = storage.get('aiEnabled', false);
  const aiStatusEl = document.getElementById('ai-status');
  function setAiEnabled(v){ aiEnabled = v; storage.set('aiEnabled', v); if(aiStatusEl) aiStatusEl.querySelector('span').textContent = v? 'on':'off'; }
  setAiEnabled(aiEnabled);
  // Toggle by clicking status (if present)
  if(aiStatusEl) aiStatusEl.addEventListener('click', ()=> setAiEnabled(!aiEnabled));

  let aiInterval = null;
  function startAiSimulation(){
    if(aiInterval) clearInterval(aiInterval);
    if(!aiEnabled) return;
    aiInterval = setInterval(()=>{
      // crude probabilistic simulation
      const now = new Date();
      const hour = now.getHours();
      let base = Math.random()*0.03;
      if(hour>=0 && hour<6) base += 0.02; // night slightly higher
      const confidence = Math.min(0.99, base + Math.random()*0.2);
      if(confidence>0.7){
        addLog('AIDetected', {confidence});
        const el = document.getElementById('alert-banner');
        el.textContent = `AI Detection: High risk (${(confidence*100).toFixed(0)}%). Recommended: Call Ambulance or open chat.`;
        el.classList.remove('hidden');
      }
    }, 15000);
  }
  startAiSimulation();

  // Start/stop when user toggles (guarded)
  if(aiStatusEl) aiStatusEl.addEventListener('click', ()=>{
    setAiEnabled(!aiEnabled);
    if(aiEnabled) startAiSimulation(); else { clearInterval(aiInterval); aiInterval=null; }
  });

  // Install prompt handling: store event and show non-intrusive install button when available
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    // Prevent automatic prompt; store the event and reveal the Install button if present
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if(installBtn) installBtn.classList.remove('hidden');
  });

  // Install button: prompt only when user explicitly clicks install
  const installBtn = document.getElementById('install-btn');
  if(installBtn){
    installBtn.addEventListener('click', async ()=>{
      if(!deferredPrompt) return; // nothing to do
      try{
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        // hide button after attempt
        installBtn.classList.add('hidden');
        deferredPrompt = null;
      }catch(err){
        console.warn('Install prompt failed', err);
      }
    });
  }

  // Chat toggle handled by chatbot-ai.js but ensure elements exist
  const chatToggle = document.getElementById('chat-toggle');
  if(chatToggle){ chatToggle.addEventListener('click', ()=>{ const panel = document.getElementById('chat-panel'); if(panel) panel.classList.toggle('hidden'); }); }

  // Expose simple API for maps and chatbot
  window.EmergencyApp = { addLog, getLastPosition: ()=> lastPosition };

  // update contacts and AI stats on pages that have stat elements
  const contactsNow = storage.get('contacts',[]);
  const statContacts = document.getElementById('stat-contacts'); if(statContacts) statContacts.textContent = contactsNow.length;
  const statAi = document.getElementById('stat-ai'); if(statAi) statAi.textContent = aiEnabled? 'On':'Off';

})();
