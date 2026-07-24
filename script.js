// ===== Farm Finder =====
// Flow: geolocate -> reverse geocode (Nominatim) -> query Overpass for farms -> render.

const $ = (id) => document.getElementById(id);

const gate = $('gate');
const app = $('app');
const locateBtn = $('locate');
const manualBtn = $('manual');
const manualForm = $('manual-form');
const manualInput = $('manual-input');
const gateStatus = $('gate-status');
const placeName = $('place-name');
const monthName = $('month-name');
const seasonList = $('season-list');
const farmList = $('farm-list');
const farmCount = $('farm-count');
const farmEmpty = $('farm-empty');
const resetBtn = $('reset');
const loader = $('loader');
const loaderText = $('loader-text');

function showLoader(txt) {
  loaderText.textContent = txt || 'Loading…';
  loader.hidden = false;
}
function hideLoader() { loader.hidden = true; }

// ---- geolocation ----
locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    gateStatus.textContent = 'Geolocation not supported. Try entering a place instead.';
    return;
  }
  gateStatus.textContent = 'Requesting location…';
  navigator.geolocation.getCurrentPosition(
    (pos) => start(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      gateStatus.textContent = err.code === 1
        ? 'Location blocked. Enter a place below.'
        : 'Couldn\'t get your location. Enter a place below.';
      manualForm.hidden = false;
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
  );
});

manualBtn.addEventListener('click', () => {
  manualForm.hidden = !manualForm.hidden;
  if (!manualForm.hidden) manualInput.focus();
});

manualForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = manualInput.value.trim();
  if (!q) return;
  gateStatus.textContent = 'Looking up…';
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!data || !data.length) {
      gateStatus.textContent = 'Couldn\'t find that place.';
      return;
    }
    start(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
  } catch {
    gateStatus.textContent = 'Lookup failed. Try again.';
  }
});

resetBtn.addEventListener('click', () => {
  app.hidden = true;
  gate.style.display = '';
  gateStatus.textContent = '';
  manualForm.hidden = true;
  manualInput.value = '';
  window.scrollTo(0, 0);
});

// ---- main flow ----
async function start(lat, lon, preLabel) {
  showLoader('Finding farms near you…');
  try {
    const [placeLabel, farms] = await Promise.all([
      preLabel ? Promise.resolve(preLabel) : reverseGeocode(lat, lon),
      fetchFarms(lat, lon)
    ]);
    renderPlace(placeLabel, lat);
    renderSeason(lat);
    renderFarms(farms, lat, lon);
    gate.style.display = 'none';
    app.hidden = false;
  } catch (e) {
    console.error(e);
    gateStatus.textContent = 'Something went wrong. Try again.';
  } finally {
    hideLoader();
  }
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.hamlet || a.county || '';
    const region = a.state || a.region || a.country || '';
    return [city, region].filter(Boolean).join(', ') || data.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

// Overpass query — farms tagged in OpenStreetMap within ~40km.
async function fetchFarms(lat, lon) {
  const radiusM = 40000;
  const q = `[out:json][timeout:20];(node(around:${radiusM},${lat},${lon})["shop"="farm"];way(around:${radiusM},${lat},${lon})["shop"="farm"];node(around:${radiusM},${lat},${lon})["place"="farm"]["name"];way(around:${radiusM},${lat},${lon})["place"="farm"]["name"];node(around:${radiusM},${lat},${lon})["landuse"="farmyard"]["name"];way(around:${radiusM},${lat},${lon})["landuse"="farmyard"]["name"];node(around:${radiusM},${lat},${lon})["tourism"="farm"];way(around:${radiusM},${lat},${lon})["tourism"="farm"];node(around:${radiusM},${lat},${lon})["shop"="greengrocer"]["organic"];);out center tags 80;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.osm.ch/api/interpreter',
    'https://overpass.private.coffee/api/interpreter'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(q),
        signal: AbortSignal.timeout(22000)
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) continue;
      let data; try { data = JSON.parse(text); } catch { continue; }
      if (!data.elements) continue;
      return data.elements.map(normalizeFarm).filter(Boolean);
    } catch {}
  }
  return [];
}

function normalizeFarm(el) {
  const t = el.tags || {};
  if (!t.name) return null;
  const lat = el.lat || (el.center && el.center.lat);
  const lon = el.lon || (el.center && el.center.lon);
  if (lat == null || lon == null) return null;
  return {
    id: el.type + '/' + el.id,
    name: t.name,
    lat, lon,
    tags: t
  };
}

// haversine, km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderPlace(label, lat) {
  placeName.textContent = label;
}

function renderSeason(lat) {
  const now = new Date();
  const m = now.getMonth();
  monthName.textContent = MONTH_NAMES[m];
  const list = getSeasonList(lat, m);
  seasonList.innerHTML = list.map(item => `<li>${item}</li>`).join('');
}

function renderFarms(farms, lat, lon) {
  // annotate distance, sort, cap
  const withDist = farms.map(f => ({
    ...f,
    distKm: distanceKm(lat, lon, f.lat, f.lon)
  })).sort((a,b) => a.distKm - b.distKm).slice(0, 40);

  farmCount.textContent = withDist.length
    ? `${withDist.length} within 40 km`
    : '';

  farmEmpty.hidden = withDist.length > 0;

  farmList.innerHTML = withDist.map(f => renderFarmItem(f, lat, lon)).join('');
}

function renderFarmItem(f, myLat, myLon) {
  const t = f.tags;
  const dist = f.distKm < 1
    ? `${Math.round(f.distKm * 1000)} m`
    : `${f.distKm.toFixed(1)} km`;

  // Access / channel tags
  const tags = [];
  if (t.organic === 'yes' || t.organic === 'only') tags.push({ label: 'Organic', solid: true });
  if (t.produce) {
    // occasionally a list; keep short
    const first = String(t.produce).split(';')[0].split(',')[0].trim();
    if (first && first.length < 24) tags.push({ label: first });
  }
  if (t['self_service'] === 'yes') tags.push({ label: 'Self-serve' });
  if (t.vending) tags.push({ label: 'Farm stand' });
  if (t.delivery === 'yes' || t['service:delivery'] === 'yes') tags.push({ label: 'Delivery' });
  if (t.pickup === 'yes' || t.takeaway === 'yes') tags.push({ label: 'Pickup' });
  if (t.csa === 'yes' || t['farm:csa'] === 'yes' || /csa/i.test(t.name)) tags.push({ label: 'CSA' });
  if (t.tourism === 'farm' || t.agrotourism === 'yes') tags.push({ label: 'Visit' });

  // Contact / address bits
  const metaBits = [];
  const addr = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
  const cityLine = [addr, t['addr:city']].filter(Boolean).join(', ');
  if (cityLine) metaBits.push(cityLine);

  const phone = t.phone || t['contact:phone'];
  if (phone) metaBits.push(`<a href="tel:${phone.replace(/\s+/g,'')}">${phone}</a>`);

  const website = t.website || t['contact:website'] || t.url;
  if (website) {
    let host = website;
    try { host = new URL(website).hostname.replace(/^www\./,''); } catch {}
    metaBits.push(`<a href="${escapeAttr(website)}" target="_blank" rel="noopener">${host}</a>`);
  }
  const opening = t.opening_hours;
  if (opening && opening.length < 40) metaBits.push(escapeText(opening));

  // Actions
  const mapsHref = `https://www.openstreetmap.org/?mlat=${f.lat}&mlon=${f.lon}#map=17/${f.lat}/${f.lon}`;
  const dirHref = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`;

  return `
    <li class="farm-item">
      <div class="farm-dist">${dist}</div>
      <div class="farm-body">
        <h4>${escapeText(f.name)}</h4>
        ${tags.length ? `<div class="farm-tags">${tags.map(x => `<span class="${x.solid ? 'solid' : ''}">${escapeText(x.label)}</span>`).join('')}</div>` : ''}
        ${metaBits.length ? `<div class="farm-meta">${metaBits.join(' &middot; ')}</div>` : ''}
      </div>
      <div class="farm-actions">
        <a href="${dirHref}" target="_blank" rel="noopener">Directions</a>
        <a href="${mapsHref}" target="_blank" rel="noopener">Map</a>
      </div>
    </li>
  `;
}

function escapeText(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'
  }[c]));
}
function escapeAttr(s){ return escapeText(s); }
