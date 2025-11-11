// Profile manager: store profile, contacts, and docs metadata in localStorage
(function(){
  const storage = {
    get(key, fallback){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):fallback;}catch(e){return fallback} },
    set(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  };

  const root = document.getElementById('profile-root');
  function render(){
    const profile = storage.get('profile', {});
    const contacts = storage.get('contacts', []);
    const docs = storage.get('docs', []);
    const savedAt = profile.savedAt ? new Date(profile.savedAt).toLocaleString() : 'Never';
    const initials = profile.name ? profile.name.split(' ').map(n=>n[0]).join('').toUpperCase() : '?';
    root.innerHTML = `
      <div class="profile-header">
        <div class="avatar">${initials}</div>
        <div class="profile-info">
          <h3>${profile.name || 'No name set'}</h3>
          <p>Last saved: ${savedAt}</p>
        </div>
        <button id="export-profile" class="primary">Export Profile</button>
      </div>
      <form id="profile-form" class="profile-form">
        <div class="form-group">
          <label>Name <input name="name" value="${profile.name||''}" /></label>
        </div>
        <div class="form-group">
          <label>Age <input name="age" type="number" value="${profile.age||''}" /></label>
        </div>
        <div class="form-group">
          <label>Blood Type <input name="blood" value="${profile.blood||''}" /></label>
        </div>
        <div class="form-group">
          <label>Allergies <textarea name="allergies">${profile.allergies||''}</textarea></label>
        </div>
        <div class="form-group">
          <label>Medications <textarea name="meds">${profile.meds||''}</textarea></label>
        </div>
        <div class="form-actions"><button id="save-profile" class="primary">Save Profile</button></div>
      </form>
      <section class="contacts">
        <h4>Emergency Contacts</h4>
        <ul id="contacts-list">
          ${contacts.map((c,i)=>`
            <li data-i="${i}" class="contact-item">
              <div class="contact-info">
                <strong>${c.name}</strong> (${c.relationship}) - ${c.number}
              </div>
              <div class="contact-actions">
                <button class="edit-contact secondary">Edit</button>
                <button class="del-contact secondary">Del</button>
              </div>
              <div class="mini-map" id="mini-map-${i}" style="height:100px;width:100%;border-radius:8px;"></div>
            </li>
          `).join('')}
        </ul>
        <form id="contact-form" class="contact-form">
          <div class="form-group">
            <input name="name" placeholder="Name" required />
          </div>
          <div class="form-group">
            <input name="relationship" placeholder="Relationship" />
          </div>
          <div class="form-group">
            <input name="number" placeholder="Phone" required />
          </div>
          <button id="add-contact" class="primary">Add Contact</button>
        </form>
      </section>
      <section class="docs">
        <h4>Medical Documents</h4>
        <ul id="docs-list">
          ${docs.map((d,i)=>`<li data-i="${i}" class="doc-item">${d.name} (${(d.size/1024).toFixed(1)} KB) <button class="del-doc secondary">Del</button></li>`).join('')}
        </ul>
        <form id="doc-form" class="doc-form">
          <input type="file" id="doc-file" />
          <button id="add-doc" class="primary">Upload (metadata only)</button>
        </form>
      </section>
    `;

    // bind
    document.getElementById('profile-form').addEventListener('submit', (e)=>{
      e.preventDefault(); const form = e.target; const data = {name: form.name.value, age: form.age.value, blood: form.blood.value, allergies: form.allergies.value, meds: form.meds.value, savedAt: new Date().toISOString()}; storage.set('profile', data); render();
    });

    document.getElementById('contact-form').addEventListener('submit', (e)=>{
      e.preventDefault(); const f = e.target; const c = {name: f.name.value, relationship: f.relationship.value, number: f.number.value}; const contacts = storage.get('contacts',[]); contacts.push(c); storage.set('contacts', contacts); render();
    });

    document.querySelectorAll('.del-contact').forEach(btn=>btn.addEventListener('click', (ev)=>{const i = parseInt(ev.target.closest('li').dataset.i,10); const contacts = storage.get('contacts',[]); contacts.splice(i,1); storage.set('contacts',contacts); render();}));
    document.querySelectorAll('.edit-contact').forEach(btn=>btn.addEventListener('click', (ev)=>{const i = parseInt(ev.target.closest('li').dataset.i,10); const contacts = storage.get('contacts',[]); const c = contacts[i]; const name = prompt('Name', c.name); if(name!=null){ c.name=name; contacts[i]=c; storage.set('contacts',contacts); render(); }}));

    document.getElementById('doc-form').addEventListener('submit', (e)=>{
      e.preventDefault(); const input = document.getElementById('doc-file'); if(!input.files.length){ alert('Choose file'); return; } const f = input.files[0]; const docs = storage.get('docs',[]); docs.push({name:f.name, size:f.size, type:f.type, ts:new Date().toISOString()}); storage.set('docs',docs); render();
    });

    document.querySelectorAll('.del-doc').forEach(btn=>btn.addEventListener('click', ev=>{ const i=parseInt(ev.target.closest('li').dataset.i,10); const docs = storage.get('docs',[]); docs.splice(i,1); storage.set('docs',docs); render(); }));

    // Export profile
    document.getElementById('export-profile').addEventListener('click', ()=>{
      const data = {profile, contacts, docs};
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emergency-profile.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Initialize mini-maps (placeholder, since no coords)
    contacts.forEach((c, i) => {
      const mapEl = document.getElementById(`mini-map-${i}`);
      if(mapEl && window.L){
        const miniMap = L.map(mapEl, {attributionControl:false, zoomControl:false}).setView([18.5204, 73.8567], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(miniMap);
        L.marker([18.5204, 73.8567]).addTo(miniMap); // placeholder marker
      }
    });
  }
  render();
  window.ProfileManager = { render };
})();
