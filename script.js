// ===== Farm Finder =====
// Flow: geolocate -> reverse geocode -> query Overpass for farms -> render.
// Overpass is picky: keep the query small, try multiple radii, race endpoints.

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
  loaderText.textContent = txt || 'Loading\u2026';
  loader.hidden = false;
}
function hideLoader() { loader.hidden = true; }

// ---- geolocation ----
locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    gateStatus.textContent = 'Geolocation not supported. Try entering a place instead.';
    manualForm.hidden = false;
    return;
  }
  gateStatus.textContent = 'Requesting location\u2026';
  navigator.geolocation.getCurrentPosition(
    (pos) => start(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      gateStatus.textContent = err.code === 1
        ? 'Location blocked. Enter a place below.'
        : "Couldn't get your location. Enter a place below.";
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
  gateStatus.textContent = 'Looking up\u2026';
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (!data || !data.length) {
      gateStatus.textContent = "Couldn't find that place.";
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
  showLoader('Finding farms near you\u2026');
  // Render place + season immediately so the UI is never empty while farms load.
  const placeLabel = preLabel || await reverseGeocode(lat, lon).catch(() => `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
  renderPlace(placeLabel);
  renderSeason(lat);
  gate.style.display = 'none';
  app.hidden = false;

  // Try Overpass at 60km first. If it fails or returns nothing, fall back to
  // our curated list of well-known farms and filter by distance.
  loaderText.textContent = 'Searching within 60 km\u2026';
  let farms = [];
  let usedRadius = 60;
  try {
    farms = await fetchFarms(lat, lon, 60000);
  } catch (e) {
    console.error('overpass failed', e);
  }

  if (farms.length < 3) {
    loaderText.textContent = 'Expanding search\u2026';
    // Merge fallback list within 150km, dedupe by name+coords.
    const fb = pickFallback(lat, lon, 150);
    const seen = new Set(farms.map(f => f.name.toLowerCase()));
    for (const f of fb) if (!seen.has(f.name.toLowerCase())) farms.push(f);
    usedRadius = 150;
  }

  renderFarms(farms, lat, lon, usedRadius);
  hideLoader();
}

function pickFallback(lat, lon, maxKm) {
  if (typeof FALLBACK_FARMS === 'undefined') return [];
  return FALLBACK_FARMS
    .map(f => ({ ...f, id: 'fb/' + f.name, distKm: distanceKm(lat, lon, f.lat, f.lon) }))
    .filter(f => f.distKm <= maxKm);
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
    headers: { 'Accept': 'application/json' }
  });
  const data = await res.json();
  const a = data.address || {};
  const city = a.city || a.town || a.village || a.hamlet || a.county || '';
  const region = a.state || a.region || a.country || '';
  return [city, region].filter(Boolean).join(', ') || data.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

// Compact Overpass query. Note: the important tag for named US farms is
// landuse=farmland (fields with a name) plus shop=farm and place=farm.
function buildQuery(lat, lon, radiusM) {
  return `[out:json][timeout:20];
(
  nwr(around:${radiusM},${lat},${lon})["shop"="farm"];
  nwr(around:${radiusM},${lat},${lon})["place"="farm"][name];
  nwr(around:${radiusM},${lat},${lon})["tourism"="farm"];
  nwr(around:${radiusM},${lat},${lon})["landuse"="farmland"][name];
  nwr(around:${radiusM},${lat},${lon})["landuse"="orchard"][name];
  nwr(around:${radiusM},${lat},${lon})["landuse"="vineyard"][name];
  nwr(around:${radiusM},${lat},${lon})["shop"="greengrocer"]["organic"];
);
out center tags 150;`;
}

// Race endpoints. Any HTML response, non-200, or empty body counts as failure
// so Promise.any doesn't resolve with junk.
async function fetchFarms(lat, lon, radiusM) {
  const q = buildQuery(lat, lon, radiusM);
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.osm.ch/api/interpreter'
  ];

  const attempts = endpoints.map(ep => tryEndpoint(ep, q));

  const overallTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('all endpoints timed out')), 20000)
  );

  try {
    const elements = await Promise.race([Promise.any(attempts), overallTimeout]);
    return elements.map(normalizeFarm).filter(Boolean);
  } catch {
    return [];
  }
}

async function tryEndpoint(ep, q) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 18000);
  try {
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: 'data=' + encodeURIComponent(q),
      signal: controller.signal
    });
    if (!r.ok) throw new Error(ep + ' ' + r.status);
    const text = await r.text();
    const trimmed = text.trim();
    if (!trimmed || trimmed[0] === '<') throw new Error(ep + ' html');
    const data = JSON.parse(trimmed);
    if (!Array.isArray(data.elements)) throw new Error(ep + ' shape');
    return data.elements;
  } finally {
    clearTimeout(t);
  }
}

function normalizeFarm(el) {
  const t = el.tags || {};
  if (!t.name) return null;
  const lat = el.lat != null ? el.lat : (el.center && el.center.lat);
  const lon = el.lon != null ? el.lon : (el.center && el.center.lon);
  if (lat == null || lon == null) return null;
  // Filter greengrocers to organic-tagged ones so the list stays on-mission.
  if (t.shop === 'greengrocer' && !(t.organic === 'yes' || t.organic === 'only')) return null;
  return {
    id: el.type + '/' + el.id,
    name: t.name,
    lat, lon,
    tags: t
  };
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function renderPlace(label) {
  placeName.textContent = label;
}

function renderSeason(lat) {
  const now = new Date();
  const m = now.getMonth();
  monthName.textContent = MONTH_NAMES[m];
  const list = getSeasonList(lat, m);
  seasonList.innerHTML = list.map(item => `<li>${item}</li>`).join('');
}

function renderFarms(farms, lat, lon, radiusKm) {
  const withDist = farms.map(f => ({
    ...f,
    distKm: f.distKm != null ? f.distKm : distanceKm(lat, lon, f.lat, f.lon)
  })).filter(f => f.distKm <= radiusKm)
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 40);

  farmCount.textContent = withDist.length
    ? `${withDist.length} within ${radiusKm} km`
    : '';

  if (!withDist.length) {
    farmEmpty.hidden = false;
    farmEmpty.textContent = `No farms found within ${radiusKm} km. Try entering a different place.`;
    farmList.innerHTML = '';
    return;
  }

  farmEmpty.hidden = true;
  farmList.innerHTML = withDist.map(f => renderFarmItem(f)).join('');
}

function renderFarmItem(f) {
  const t = f.tags;
  const dist = f.distKm < 1
    ? `${Math.round(f.distKm * 1000)} m`
    : `${f.distKm.toFixed(1)} km`;

  const tags = [];
  if (t.organic === 'yes' || t.organic === 'only') tags.push({ label: 'Organic', solid: true });
  if (t.produce) {
    const first = String(t.produce).split(';')[0].split(',')[0].trim();
    if (first && first.length < 24) tags.push({ label: first });
  }
  if (t['self_service'] === 'yes') tags.push({ label: 'Self-serve' });
  if (t.vending) tags.push({ label: 'Farm stand' });
  if (t.delivery === 'yes' || t['service:delivery'] === 'yes') tags.push({ label: 'Delivery' });
  if (t.pickup === 'yes' || t.takeaway === 'yes') tags.push({ label: 'Pickup' });
  if (t.csa === 'yes' || t['farm:csa'] === 'yes' || /csa/i.test(t.name)) tags.push({ label: 'CSA' });
  if (t.tourism === 'farm' || t.agrotourism === 'yes') tags.push({ label: 'Visit' });

  const metaBits = [];
  const addr = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
  const cityLine = [addr, t['addr:city']].filter(Boolean).join(', ');
  if (cityLine) metaBits.push(escapeText(cityLine));

  const phone = t.phone || t['contact:phone'];
  if (phone) metaBits.push(`<a href="tel:${phone.replace(/\s+/g,'')}">${escapeText(phone)}</a>`);

  const website = t.website || t['contact:website'] || t.url;
  if (website) {
    let host = website;
    try { host = new URL(website).hostname.replace(/^www\./,''); } catch {}
    metaBits.push(`<a href="${escapeAttr(website)}" target="_blank" rel="noopener">${escapeText(host)}</a>`);
  }
  const opening = t.opening_hours;
  if (opening && opening.length < 40) metaBits.push(escapeText(opening));

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
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function escapeAttr(s){ return escapeText(s); }
