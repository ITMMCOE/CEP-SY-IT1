// Leaflet map initialization and markers
(function(){
  const mapEl = document.getElementById('map');
  if(!mapEl) return;
  const map = L.map(mapEl, {attributionControl:true}).setView([18.5204, 73.8567], 12); // Pune center
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19});
  tiles.addTo(map);

  let userMarker = null;
  let userLocation = null;
  let watchId = null;

  // Custom icon for user location
  const userIcon = L.divIcon({
    className: 'user-location-icon',
    html: '<div style="background: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.5);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  function updateUserMarker(latlng){
    if(!latlng) return;
    userLocation = latlng;
    if(!userMarker){ 
      userMarker = L.marker(latlng, {icon: userIcon, title:'Your Location', zIndexOffset:1000}).addTo(map);
      userMarker.bindPopup('<strong>You are here</strong>');
    } else {
      userMarker.setLatLng(latlng);
    }
    map.setView(latlng, 14);
  }

  // Get user's live location
  function startLocationTracking(){
    if(!navigator.geolocation){
      console.log('Geolocation not supported');
      alert('Geolocation is not supported by your browser. Using default location.');
      updateUserMarker([18.5204, 73.8567]);
      return;
    }
    
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = [position.coords.latitude, position.coords.longitude];
        console.log('Got user location:', latlng);
        updateUserMarker(latlng);
        // Show nearby services after location is obtained
        const currentFilter = document.getElementById('map-filter')?.value || 'all';
        showNearbyServices(currentFilter);
      },
      (error) => {
        console.error('Location error:', error.message);
        alert('Unable to get your location. Please enable location services. Using Pune center as default.');
        // Fallback to Pune center if location denied
        const fallbackLocation = [18.5204, 73.8567];
        updateUserMarker(fallbackLocation);
        // Still show services with fallback location
        const currentFilter = document.getElementById('map-filter')?.value || 'all';
        showNearbyServices(currentFilter);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position for continuous updates
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latlng = [position.coords.latitude, position.coords.longitude];
        console.log('Location updated:', latlng);
        updateUserMarker(latlng);
        // Refresh nearby services when location updates
        const currentFilter = document.getElementById('map-filter')?.value || 'all';
        showNearbyServices(currentFilter);
      },
      (error) => console.error('Watch error:', error.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  }

  // Calculate distance between two coordinates (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Sample services in Pune - expanded list with more locations
  const sampleServices = [
    // Hospitals
    {type:'hospital', name:'Ruby Hall Clinic', coords:[18.5308, 73.8475]},
    {type:'hospital', name:'Sahyadri Hospital', coords:[18.5310, 73.8900]},
    {type:'hospital', name:'KEM Hospital', coords:[18.4950, 73.8572]},
    {type:'hospital', name:'Deenanath Mangeshkar Hospital', coords:[18.4658, 73.8275]},
    {type:'hospital', name:'Aditya Birla Memorial Hospital', coords:[18.5679, 73.9143]},
    // Police Stations
    {type:'police', name:'Shivajinagar Police Station', coords:[18.5311, 73.8467]},
    {type:'police', name:'Deccan Police Station', coords:[18.5164, 73.8405]},
    {type:'police', name:'Kothrud Police Station', coords:[18.5074, 73.8077]},
    {type:'police', name:'Pune City Police HQ', coords:[18.5196, 73.8554]},
    // Fire Stations
    {type:'fire', name:'Pune Fire Brigade HQ', coords:[18.5215, 73.8542]},
    {type:'fire', name:'Deccan Fire Station', coords:[18.5150, 73.8420]},
    {type:'fire', name:'Kothrud Fire Station', coords:[18.5020, 73.8090]},
    // Mechanics
    {type:'mechanic', name:'24/7 Roadside Mechanic', coords:[18.5180, 73.8580]},
    {type:'mechanic', name:'Auto Care Center', coords:[18.5250, 73.8650]},
    {type:'mechanic', name:'Quick Fix Garage', coords:[18.4980, 73.8480]}
  ];

  const layerGroup = L.layerGroup().addTo(map);

  // Show nearby services based on user location
  function showNearbyServices(filter='all'){
    if(!userLocation) return;
    
    // Calculate distances and sort
    const servicesWithDistance = sampleServices.map(service => ({
      ...service,
      distance: calculateDistance(
        userLocation[0], userLocation[1],
        service.coords[0], service.coords[1]
      )
    })).filter(s => filter === 'all' || s.type === filter)
      .sort((a, b) => a.distance - b.distance);

    renderMarkersWithDistance(servicesWithDistance);
  }

  function renderMarkersWithDistance(services){
    layerGroup.clearLayers();
    services.forEach((s, index) => {
      const isNearest = index < 3; // Highlight 3 nearest
      const iconColor = isNearest ? '#ef4444' : '#3b82f6';
      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="background: ${iconColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${s.type === 'hospital' ? '🏥' : s.type === 'police' ? '👮' : s.type === 'fire' ? '🚒' : '🔧'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const m = L.marker(s.coords, {icon: customIcon, title: s.name});
      const distanceText = s.distance < 1 ? `${(s.distance * 1000).toFixed(0)}m` : `${s.distance.toFixed(2)}km`;
      const phoneNum = s.type === 'hospital' ? '108' : s.type === 'police' ? '100' : s.type === 'fire' ? '101' : '1234567890';
      
      m.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${s.name}</strong><br/>
          <em style="text-transform: capitalize;">${s.type}</em><br/>
          <span style="color: #059669; font-weight: bold;">📍 ${distanceText} away</span><br/><br/>
          <button class="call-now" data-num="${phoneNum}" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">📞 Call</button>
          <button class="nav" data-lat="${s.coords[0]}" data-lng="${s.coords[1]}" style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🧭 Navigate</button>
        </div>
      `);
      layerGroup.addLayer(m);
    });
  }

  // Filter change event
  const filterEl = document.getElementById('map-filter');
  if(filterEl) {
    filterEl.addEventListener('change', (e) => {
      if(userLocation) {
        showNearbyServices(e.target.value);
      } else {
        // Fallback if no user location yet
        renderMarkersWithDistance(
          sampleServices.filter(s => e.target.value === 'all' || s.type === e.target.value)
            .map(s => ({...s, distance: 0}))
        );
      }
    });
  }

  // Show initial markers before location is obtained
  renderMarkersWithDistance(sampleServices.map(s => ({...s, distance: 0})));

  // Start tracking user location on map load
  setTimeout(() => {
    startLocationTracking();
  }, 500);

  // Add "Locate Me" button functionality
  const locateMeBtn = document.getElementById('locate-me');
  if(locateMeBtn) {
    locateMeBtn.addEventListener('click', () => {
      locateMeBtn.textContent = '📍 Locating...';
      locateMeBtn.disabled = true;
      startLocationTracking();
      setTimeout(() => {
        locateMeBtn.textContent = '📍 Locate Me';
        locateMeBtn.disabled = false;
      }, 2000);
    });
  }

  // Add event for Karvenagar
  const karvenagarBtn = document.getElementById('show-karvenagar');
  if(karvenagarBtn) karvenagarBtn.addEventListener('click', showKarvenagar);

  // delegate popup button clicks
  map.on('popupopen', function(e){
    const px = e.popup._contentNode;
    px.querySelectorAll('.nav').forEach(b=> b.addEventListener('click', (ev)=>{
      const lat = ev.target.dataset.lat; const lng = ev.target.dataset.lng;
      // open external maps (OS will handle)
      window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}`,'_blank');
    }));
    px.querySelectorAll('.call-now').forEach(b=> b.addEventListener('click', (ev)=>{
      const n = ev.target.dataset.num || '108'; window.location.href = `tel:${n}`;
    }));
  });

  // Show Karvenagar
  function showKarvenagar(){
    const karvenagarCoords = [18.4886644, 73.8140880];
    map.setView(karvenagarCoords, 14);
    L.marker(karvenagarCoords, {title: 'Karvenagar'}).addTo(layerGroup).bindPopup('Karvenagar, Pune');
  }

  // Show nearby service by type
  function showNearbyService(type){
    showNearbyServices(type);
  }

  // Expose helpers
  window.EmergencyMap = {
    updateUserMarker: (latlng)=> updateUserMarker(latlng),
    filterAndOpen: (type)=> showNearbyService(type),
    showKarvenagar: showKarvenagar,
    showNearbyService: showNearbyService,
    refreshLocation: startLocationTracking,
    stopTracking: () => { if(watchId) navigator.geolocation.clearWatch(watchId); }
  };

})();
