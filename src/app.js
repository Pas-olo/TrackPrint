// app.js — UI logic v4

let statsYear = new Date().getFullYear();
let calYear   = new Date().getFullYear();
let logYear   = new Date().getFullYear();
let calMonth  = new Date().getMonth();
let logMonth  = new Date().getMonth();

let chartCountry, chartKm, chartCo2;
let carouselIndex = 0;
let topTrips = [];

// Transport modal state
let currentModalDate = '';
let pendingRows = [];
let currentMode = 'Plane';
let editingTransportId = null; // null = new, number = editing existing

// Date picker state
let datePickerTarget = '';
let stayStart = '', stayEnd = '';

// Calendar day detail state
let selectedCalDate = null;

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  dbInit();
  populateCountrySelect();
  setDefaultStayDates();
  buildModeGrid();
  renderStats();
  buildMonthBars();
});

function populateCountrySelect() {
  const sel = document.getElementById('stay-country-select');
  sel.innerHTML = COUNTRIES_LIST.map(c => `<option value="${c.iso}">${c.label}</option>`).join('');
  sel.value = 'FR';
}

function setDefaultStayDates() {
  const today = todayStr();
  stayStart = today; stayEnd = today;
  updateStayDateDisplay();
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function nbDays(d1, d2) { return Math.round((new Date(d2) - new Date(d1)) / 86400000) + 1; }

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtDateShort(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function fmtDateLong(str) {
  const d = new Date(str + 'T00:00:00');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return `${days[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

function showToast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' error' : '') + ' show';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Tab navigation ────────────────────────────────────────────────────
const TAB_TITLES = { stats:'📊 TrackPrint', calendar:"🌍 TrackPrint", log:'📋 TrackPrint', data:'💾 TrackPrint' };

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('screen-' + tab).classList.add('active');
  document.getElementById('header-title').textContent = TAB_TITLES[tab];
  if (tab === 'stats')    { renderStats(); }
  if (tab === 'calendar') renderCalendar();
  if (tab === 'log')      renderLog();
  if (tab === 'data')     renderGlobalStats();
}

// ── Month nav bars ────────────────────────────────────────────────────
function buildMonthBars() {
  buildMonthBar('cal-month-bar', calMonth, m => { calMonth = m; renderCalendar(); });
  buildMonthBar('log-month-bar', logMonth, m => { logMonth = m; renderLog(); });
}

function buildMonthBar(containerId, activeMonth, onClick) {
  const bar = document.getElementById(containerId);
  bar.innerHTML = MONTHS_SHORT.map((name, i) =>
    `<div class="month-pill ${i === activeMonth ? 'active' : ''}" id="${containerId}-pill-${i}" onclick="onMonthPill('${containerId}',${i})">${name}</div>`
  ).join('');
}

function onMonthPill(barId, idx) {
  document.querySelectorAll(`#${barId} .month-pill`).forEach((p, i) =>
    p.classList.toggle('active', i === idx)
  );
  if (barId === 'cal-month-bar') { calMonth = idx; renderCalendar(); }
  else                           { logMonth = idx; renderLog(); }
}

function scrollToActiveMonth(barId, idx) {
  const pill = document.getElementById(`${barId}-pill-${idx}`);
  if (pill) pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ── STATS ─────────────────────────────────────────────────────────────
function changeStatsYear(d) {
  statsYear += d;
  document.getElementById('stats-year-lbl').textContent = statsYear;
  renderStats();
}

function renderStats() {
  const sejours    = dbGetSejoursForYear(statsYear);
  const transports = dbGetTransportsForYear(statsYear);
  const stats      = computeStats(transports, sejours);
  const totalDays  = sejours.reduce((a, s) => a + nbDays(s.date_debut, s.date_fin), 0);

  document.getElementById('stat-days').textContent = totalDays;
  document.getElementById('stat-km').textContent   = Math.round(stats.totalKm).toLocaleString('en');
  document.getElementById('stat-co2').textContent  = Math.round(stats.totalCo2).toLocaleString('en');

  // Carbon intensity (gCO2e/km)
  const intensity = stats.totalKm > 0 ? Math.round((stats.totalCo2 / stats.totalKm) * 1000) : null;
  document.getElementById('stat-intensity').textContent = intensity !== null ? intensity : '—';

  // Streak: nb of countries visited since last plane trip (up to today)
  const streak = computeNoFlightStreak();
  document.getElementById('stat-streak').textContent = streak;

  renderCarbonEquivalent(stats.totalCo2);
  renderTopTripsByMode(transports);
  renderCountryChart(stats);
  renderKmChart(stats);
  renderCo2Chart(stats);
  renderCO2Ranking(stats.totalCo2);
  renderMap();
}

function renderCarbonEquivalent(co2kg) {
  const card = document.getElementById('carbon-eq-card');
  if (!co2kg || co2kg < 10) {
    card.innerHTML = `
      <div class="carbon-eq-title">YOUR CARBON FOOTPRINT</div>
      <div class="carbon-eq-body" style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0">
        <span style="color:var(--muted);font-size:13px">No data recorded yet.</span>
        <button class="btn-demo-load" onclick="loadDemoData()">🗂️ Load demo dataset</button>
      </div>`;
    return;
  }
  const eq = findCarbonEquivalent(co2kg);
  if (!eq) return;
  const pct = Math.round((co2kg / eq.annual) * 100);
  const name = getCountryName(eq.iso);
  const flag = getFlagEmoji(eq.iso);
  card.innerHTML = `
    <div class="carbon-eq-title">YOUR TRANSPORT CARBON FOOTPRINT</div>
    <div class="carbon-eq-body">
      <span class="carbon-eq-flag">${flag}</span>
      Your <strong>${Math.round(co2kg).toLocaleString('en')} kgCO2e</strong> of transport emissions
      represents <strong>${pct}%</strong> of the average annual footprint
      of a resident of <strong>${name}</strong>
      (${eq.annual.toLocaleString('en')} kg/year).
    </div>`;
}

// Top 3 per mode — swipeable cards, one card per mode showing top 3 trips as rows
function renderTopTripsByMode(transports) {
  const CAROUSEL_MODES = ['Plane','Train','Car','Bus','Boat','Bike','Walk'];
  const slides = [];

  CAROUSEL_MODES.forEach(mode => {
    const top3 = transports
      .filter(t => t.mode === mode && t.distance > 0)
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 3);
    if (top3.length === 0) return;
    slides.push({ mode, icon: MODE_ICONS[mode], trips: top3 });
  });

  topTrips = slides;
  const track = document.getElementById('top-trips-track');
  const dots  = document.getElementById('carousel-dots');

  if (slides.length === 0) {
    track.innerHTML = `<div class="carousel-slide"><div class="trip-card"><div class="trip-card-route" style="color:var(--dim)">No trips recorded yet</div></div></div>`;
    dots.innerHTML = '';
    return;
  }

  track.innerHTML = slides.map(s => {
    const rows = s.trips.map((t, i) => {
      const co2   = calculateCO2(t);
      const route = t.origine && t.destination ? `${t.origine} → ${t.destination}` : (t.origine || t.destination || '—');
      const d     = new Date(t.date + 'T00:00:00');
      const dStr  = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      return `<div class="top3-row ${i < s.trips.length-1 ? 'top3-row-sep' : ''}">
        <span class="top3-medal">${['🥇','🥈','🥉'][i]}</span>
        <div class="top3-info">
          <div class="top3-route">${route}</div>
          <div class="top3-meta">${dStr}</div>
        </div>
        <div class="top3-stats">
          <span class="top3-km">${Math.round(t.distance).toLocaleString('en')} km</span>
          ${co2 > 0 ? `<span class="top3-co2">${Math.round(co2).toLocaleString('en')} kgCO2e</span>` : ''}
        </div>
      </div>`;
    }).join('');
    return `<div class="carousel-slide">
      <div class="trip-card">
        <div class="trip-card-mode">${s.icon} <span style="font-size:12px;color:var(--muted);font-weight:600;vertical-align:middle">${s.mode}</span></div>
        <div class="top3-list">${rows}</div>
      </div>
    </div>`;
  }).join('');

  dots.innerHTML = slides.map((_, i) =>
    `<div class="c-dot ${i === 0 ? 'active' : ''}" onclick="goCarousel(${i})"></div>`
  ).join('');

  carouselIndex = 0;
  updateCarousel();

  clearInterval(window._carouselTimer);
  if (slides.length > 1) {
    window._carouselTimer = setInterval(() => {
      carouselIndex = (carouselIndex + 1) % slides.length;
      updateCarousel();
    }, 3000);
  }

  // Touch swipe support
  let _touchStartX = null;
  track.ontouchstart = e => { _touchStartX = e.touches[0].clientX; };
  track.ontouchend = e => {
    if (_touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - _touchStartX;
    _touchStartX = null;
    if (Math.abs(dx) < 30) return;
    if (dx < 0) goCarousel((carouselIndex + 1) % topTrips.length);
    else        goCarousel((carouselIndex - 1 + topTrips.length) % topTrips.length);
  };
}

function goCarousel(idx) {
  carouselIndex = idx;
  updateCarousel();
  clearInterval(window._carouselTimer);
  if (topTrips.length > 1) {
    window._carouselTimer = setInterval(() => {
      carouselIndex = (carouselIndex + 1) % topTrips.length;
      updateCarousel();
    }, 3000);
  }
}

function updateCarousel() {
  const track = document.getElementById('top-trips-track');
  track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function renderCountryChart(stats) {
  const keys = Object.keys(stats.countryCounts);
  const vals = keys.map(k => stats.countryCounts[k]);
  const total = vals.reduce((a, b) => a + b, 0);
  const lbls  = keys.map(k => `${getFlagEmoji(k)} ${getCountryName(k)}`);
  if (chartCountry) chartCountry.destroy();
  chartCountry = new Chart(document.getElementById('chart-country'), {
    type: 'doughnut',
    data: { labels: lbls, datasets: [{ data: vals, backgroundColor: PIE_COLORS, borderWidth: 0 }] },
    options: {
      responsive: true, cutout: '58%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => {
              const pct = Math.round((c.raw / total) * 100);
              return ` ${c.raw}d — ${pct}%`;
            },
            title: c => c[0]?.label || '',
          }
        }
      }
    },
  });
  document.getElementById('legend-country').innerHTML = keys.map((k, i) => {
    const pct = Math.round((stats.countryCounts[k] / total) * 100);
    return `<div class="legend-item"><div class="legend-dot" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></div><span class="legend-text">${getFlagEmoji(k)} ${getCountryName(k)} — ${stats.countryCounts[k]}d (${pct}%)</span></div>`;
  }).join('');
}

function renderKmChart(stats) {
  const modes = Object.keys(MODE_COLORS).filter(m => stats.kmByMode[m]?.some(v => v > 0));
  if (chartKm) chartKm.destroy();
  chartKm = new Chart(document.getElementById('chart-km'), {
    type: 'bar',
    data: { labels: MONTHS_SHORT, datasets: modes.map(m => ({ label:m, stack:'s', borderWidth:0, backgroundColor:MODE_COLORS[m], data:stats.kmByMode[m].map(v => Math.round(v)) })) },
    options: { responsive: true, scales: { x:{stacked:true,ticks:{color:'#666',font:{size:9}},grid:{color:'#1a1a2e'}}, y:{stacked:true,ticks:{color:'#666',font:{size:9}},grid:{color:'#252540'}} }, plugins:{legend:{display:false}} },
  });
  document.getElementById('legend-km').innerHTML = modes.map(m =>
    `<div class="legend-item"><div class="legend-dot" style="background:${MODE_COLORS[m]}"></div><span class="legend-text">${MODE_ICONS[m]} ${m}</span></div>`
  ).join('');
}

function renderCo2Chart(stats) {
  const modes = Object.keys(MODE_COLORS).filter(m => stats.co2ByMode[m]?.some(v => v > 0));
  if (chartCo2) chartCo2.destroy();
  chartCo2 = new Chart(document.getElementById('chart-co2'), {
    type: 'bar',
    data: { labels: MONTHS_SHORT, datasets: modes.map(m => ({ label:m, stack:'s', borderWidth:0, backgroundColor:MODE_COLORS[m], data:stats.co2ByMode[m].map(v => Math.round(v)) })) },
    options: { responsive: true, scales: { x:{stacked:true,ticks:{color:'#666',font:{size:9}},grid:{color:'#1a1a2e'}}, y:{stacked:true,ticks:{color:'#666',font:{size:9}},grid:{color:'#252540'}} }, plugins:{legend:{display:false}} },
  });
  document.getElementById('legend-co2').innerHTML = modes.map(m =>
    `<div class="legend-item"><div class="legend-dot" style="background:${MODE_COLORS[m]}"></div><span class="legend-text">${MODE_ICONS[m]} ${m}</span></div>`
  ).join('');
}

function renderCO2Ranking(userCo2kg) {
  const el = document.getElementById('co2-ranking');
  if (!el) return;

  const list = Object.entries(EMISSIONS_DATA)
    .filter(([iso]) => iso !== '_world')
    .map(([iso, annual]) => ({ iso, annual, name: getCountryName(iso), flag: getFlagEmoji(iso) }))
    .sort((a, b) => a.annual - b.annual);

  const userEntry = { iso: '_you', annual: userCo2kg, name: 'You', flag: '🧑' };
  let insertIdx = list.findIndex(c => c.annual > userCo2kg);
  if (insertIdx === -1) insertIdx = list.length;
  const withUser = [...list.slice(0, insertIdx), userEntry, ...list.slice(insertIdx)];
  const userPos  = insertIdx;

  // Show ±3 countries around the user's rank
  const start = Math.max(0, userPos - 3);
  const end   = Math.min(withUser.length - 1, userPos + 3);
  const slice = withUser.slice(start, end + 1);

  if (userCo2kg < 10) {
    el.innerHTML = `<div class="ranking-empty">Record transport trips to see your ranking.</div>`;
    return;
  }

  const rows = slice.map(entry => {
    const rank     = withUser.indexOf(entry) + 1;
    const isUser   = entry.iso === '_you';
    const valT     = (entry.annual / 1000).toFixed(1); // kg → t
    return `<div class="ranking-row ${isUser ? 'ranking-row-you' : ''}">
      <span class="ranking-pos">#${rank}</span>
      <span class="ranking-flag">${entry.flag}</span>
      <span class="ranking-name">${isUser ? '<strong>You</strong>' : entry.name}</span>
      <span class="ranking-val">${valT} tCO2/year</span>
    </div>`;
  }).join('');

  const userRank = userPos + 1;
  const total    = withUser.length;
  el.innerHTML = `
    <div class="ranking-header">Your transport emissions vs. annual national averages</div>
    <div class="ranking-subtitle">Rank <strong>#${userRank}</strong> out of ${total} countries · <span style="color:var(--muted)">consumption-based, 2023</span></div>
    <div class="ranking-list">${rows}</div>`;
}

// ── Streak: nb countries visited since last plane trip ────────────────
function computeNoFlightStreak() {
  const today = todayStr();
  // Find last plane trip on or before today
  const allFlights = dbGetTransports()
    .filter(t => t.mode === 'Plane' && t.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const lastFlight = allFlights[0];
  const since = lastFlight ? lastFlight.date : null;

  // Count distinct countries visited since the last flight
  // (includes the stay active on the flight date itself)
  const sejours = dbGetSejours();
  const countries = new Set();
  sejours.forEach(s => {
    if (s.date_debut > today) return;
    if (!since || s.date_debut >= since) countries.add(s.iso_code);
  });
  return countries.size;
}

// ── MAP PAN / ZOOM ────────────────────────────────────────────────────
let _mapView = null; // { x, y, w, h } — current viewBox
let _mapOrigVB = null; // original viewBox (reset target)

function _getSvg() { return document.querySelector('#map-section-wrap svg'); }

function _applyViewBox() {
  const svg = _getSvg();
  const btn = document.getElementById('map-reset-btn');
  if (!svg || !_mapView) return;
  svg.setAttribute('viewBox', `${_mapView.x} ${_mapView.y} ${_mapView.w} ${_mapView.h}`);
  const isReset = _mapOrigVB &&
    Math.abs(_mapView.x - _mapOrigVB.x) < 0.1 &&
    Math.abs(_mapView.y - _mapOrigVB.y) < 0.1 &&
    Math.abs(_mapView.w - _mapOrigVB.w) < 0.1;
  if (btn) btn.style.display = isReset ? 'none' : 'block';
}

function resetMapView() {
  if (_mapOrigVB) { _mapView = {..._mapOrigVB}; _applyViewBox(); }
}

// Convert a point in element-pixels to SVG viewBox coordinates
function _clientToVB(svg, cx, cy) {
  const r = svg.getBoundingClientRect();
  const px = (cx - r.left) / r.width;
  const py = (cy - r.top)  / r.height;
  return { x: _mapView.x + px * _mapView.w, y: _mapView.y + py * _mapView.h };
}

function _zoomViewBox(svg, focusX, focusY, factor) {
  factor = Math.min(Math.max(factor, 0.5 / (_mapOrigVB.w / _mapView.w)), 8 / (_mapOrigVB.w / _mapView.w));
  const nw = _mapView.w * factor;
  const nh = _mapView.h * factor;
  // Keep focus point fixed
  const pt = _clientToVB(svg, focusX, focusY);
  const r  = svg.getBoundingClientRect();
  const px = (focusX - r.left) / r.width;
  const py = (focusY - r.top)  / r.height;
  _mapView = { x: pt.x - px * nw, y: pt.y - py * nh, w: nw, h: nh };
  _applyViewBox();
}

function initMapInteraction() {
  const wrap = document.getElementById('map-section-wrap');
  if (!wrap) return;

  // Always re-capture viewBox (SVG may have been reloaded)
  const svg = _getSvg();
  if (!svg) return;
  const vb = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
  _mapOrigVB = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  _mapView   = { ..._mapOrigVB };

  // Event listeners only bound once
  if (wrap._interactionBound) return;
  wrap._interactionBound = true;

  // ── Touch: pinch-zoom + pan ───────────────────────────────────────
  let _t0 = null;

  wrap.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      _t0 = { type:'pan', x: e.touches[0].clientX, y: e.touches[0].clientY, vb: {..._mapView} };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      _t0 = { type:'pinch',
               dist: Math.hypot(dx, dy),
               mx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
               my: (e.touches[0].clientY + e.touches[1].clientY) / 2,
               vb: {..._mapView} };
    }
    e.preventDefault();
  }, { passive: false });

  wrap.addEventListener('touchmove', e => {
    if (!_t0) return;
    e.preventDefault();
    const svg = _getSvg();
    if (!svg) return;

    if (_t0.type === 'pan' && e.touches.length === 1) {
      const dx = e.touches[0].clientX - _t0.x;
      const dy = e.touches[0].clientY - _t0.y;
      const r  = svg.getBoundingClientRect();
      // Convert pixel delta to viewBox delta
      _mapView = {
        ..._t0.vb,
        x: _t0.vb.x - dx * (_t0.vb.w / r.width),
        y: _t0.vb.y - dy * (_t0.vb.h / r.height),
      };
      _applyViewBox();

    } else if (_t0.type === 'pinch' && e.touches.length === 2) {
      const dx   = e.touches[1].clientX - e.touches[0].clientX;
      const dy   = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const mx   = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my   = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      // Zoom factor relative to pinch-start viewBox
      const rawFactor = _t0.dist / dist;
      const minF = 0.5 / (_mapOrigVB.w / _t0.vb.w);
      const maxF = 8   / (_mapOrigVB.w / _t0.vb.w);
      const factor = Math.min(Math.max(rawFactor, minF), maxF);

      const nw = _t0.vb.w * factor;
      const nh = _t0.vb.h * factor;
      const r  = svg.getBoundingClientRect();
      const px = (mx - r.left) / r.width;
      const py = (my - r.top)  / r.height;
      // Anchor: midpoint in original VB space
      const ax = _t0.vb.x + px * _t0.vb.w;
      const ay = _t0.vb.y + py * _t0.vb.h;
      // Pan delta (midpoint may have moved too)
      const pdx = (mx - _t0.mx) * (_t0.vb.w / r.width);
      const pdy = (my - _t0.my) * (_t0.vb.h / r.height);
      _mapView = { x: ax - px * nw - pdx, y: ay - py * nh - pdy, w: nw, h: nh };
      _applyViewBox();
    }
  }, { passive: false });

  wrap.addEventListener('touchend', e => { if (e.touches.length === 0) _t0 = null; });

  // ── Mouse: drag + wheel zoom ──────────────────────────────────────
  let _drag = null;
  wrap.addEventListener('mousedown', e => {
    const svg = _getSvg();
    if (!svg) return;
    _drag = { x: e.clientX, y: e.clientY, vb: {..._mapView} };
    wrap.classList.add('panning');
  });
  window.addEventListener('mousemove', e => {
    if (!_drag) return;
    const svg = _getSvg();
    if (!svg) return;
    const r  = svg.getBoundingClientRect();
    const dx = e.clientX - _drag.x;
    const dy = e.clientY - _drag.y;
    _mapView = {
      ..._drag.vb,
      x: _drag.vb.x - dx * (_drag.vb.w / r.width),
      y: _drag.vb.y - dy * (_drag.vb.h / r.height),
    };
    _applyViewBox();
  });
  window.addEventListener('mouseup', () => { _drag = null; wrap.classList.remove('panning'); });

  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    const svg = _getSvg();
    if (!svg) return;
    _zoomViewBox(svg, e.clientX, e.clientY, e.deltaY > 0 ? 1.15 : 0.87);
  }, { passive: false });
}

function renderMap() {
  const visited = new Set(dbGetSejours().map(s => s.iso_code));
  // Support both old map screen and new inline location in stats
  const wrap = document.getElementById('map-section-wrap') || document.getElementById('world-map-wrap');
  if (!wrap) return;

  if (!wrap._svgLoaded) {
    fetch('world_map.svg')
      .then(r => r.text())
      .then(svg => {
        wrap.innerHTML = svg;
        wrap._svgLoaded = true;
        colorizeMap(visited);
        initMapInteraction();
      })
      .catch(() => {
        // Fallback for Capacitor file:// context
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'world_map.svg', true);
        xhr.onload = () => {
          wrap.innerHTML = xhr.responseText;
          wrap._svgLoaded = true;
          colorizeMap(visited);
          initMapInteraction();
        };
        xhr.send();
      });
  } else {
    colorizeMap(visited);
    initMapInteraction();
    resetMapView();
  }

  // Country count
  const countEl = document.getElementById('map-count') || document.getElementById('map-count-inline');
  if (countEl) countEl.textContent = `${visited.size} countr${visited.size !== 1 ? 'ies' : 'y'} visited`;

  // Country list below map
  const list = [...visited].map(iso => ({
    iso, name: getCountryName(iso), flag: getFlagEmoji(iso),
    days: dbGetSejours().filter(s => s.iso_code === iso).reduce((a,s) => a + nbDays(s.date_debut, s.date_fin), 0)
  })).sort((a, b) => b.days - a.days);

  const listEl = document.getElementById('map-country-list') || document.getElementById('map-country-list-inline');
  if (listEl) listEl.innerHTML = list.length === 0
    ? `<div class="map-empty">No stays recorded yet.</div>`
    : `<div class="map-list">${list.map(c =>
        `<div class="map-list-item">
          <span class="map-list-flag">${c.flag}</span>
          <span class="map-list-name">${c.name}</span>
          <span class="map-list-days">${c.days}d</span>
        </div>`
      ).join('')}</div>`;
}

function colorizeMap(visited) {
  // Maps SVG class names to ISO codes (for countries that use class= instead of id=)
  const CLASS_TO_ISO = {
    'American Samoa':'AS','Angola':'AO','Antigua and Barbuda':'AG','Argentina':'AR',
    'Australia':'AU','Azerbaijan':'AZ','Bahamas':'BS','Canada':'CA','Canary Islands (Spain)':'ES',
    'Cape Verde':'CV','Cayman Islands':'KY','Chile':'CL','China':'CN','Comoros':'KM',
    'Cyprus':'CY','Denmark':'DK','Faeroe Islands':'FO','Falkland Islands':'FK',
    'Federated States of Micronesia':'FM','Fiji':'FJ','France':'FR','French Polynesia':'PF',
    'Greece':'GR','Guadeloupe':'GP','Indonesia':'ID','Italy':'IT','Japan':'JP',
    'Malaysia':'MY','Malta':'MT','Mauritius':'MU','New Caledonia':'NC','New Zealand':'NZ',
    'Northern Mariana Islands':'MP','Norway':'NO','Oman':'OM','Papua New Guinea':'PG',
    'Philippines':'PH','Puerto Rico':'PR','Russian Federation':'RU','Saint Kitts and Nevis':'KN',
    'Samoa':'WS','Seychelles':'SC','Solomon Islands':'SB','São Tomé and Principe':'ST',
    'Tonga':'TO','Trinidad and Tobago':'TT','Turkey':'TR','Turks and Caicos Islands':'TC',
    'United Kingdom':'GB','United States':'US','United States Virgin Islands':'VI','Vanuatu':'VU'
  };
  // id="c-FR" (old), id="FR" (new), or class-based fallback via CLASS_TO_ISO
  const paths = document.querySelectorAll('#world-map-wrap path, #map-section-wrap path');
  paths.forEach(path => {
    const rawId = path.id || '';
    let iso = rawId.startsWith('c-') ? rawId.slice(2) : rawId;
    if (!iso) {
      const cls = path.className?.baseVal || path.getAttribute('class') || '';
      iso = CLASS_TO_ISO[cls] || '';
    }
    if (!iso) return;
    if (visited.has(iso)) {
      path.style.fill = '#4e9af1';
      path.style.opacity = '0.85';
      path.style.cursor = 'pointer';
      path.setAttribute('title', getCountryName(iso));
    } else {
      path.style.fill = '#1a2a3a';
      path.style.opacity = '1';
    }
  });
}


// ── DUPLICATE TRANSPORT ───────────────────────────────────────────────
function duplicateTransport(id) {
  const t = dbGetTransports().find(x => x.id === id);
  if (!t) return;
  closeTripDetail();

  // Pre-fill date picker for duplication
  _duplicateData = {...t};
  document.getElementById('dup-modal-route').textContent =
    t.origine && t.destination ? `${t.origine} → ${t.destination}` : (t.origine || t.destination || t.mode);
  document.getElementById('dup-date-input').value = todayStr();
  document.getElementById('dup-modal').classList.add('open');
}

function closeDupModal() {
  document.getElementById('dup-modal').classList.remove('open');
  _duplicateData = null;
}

let _duplicateData = null;

function confirmDuplicate() {
  const date = document.getElementById('dup-date-input').value;
  if (!date) { showToast('Pick a date', true); return; }
  if (!_duplicateData) return;

  const newTrip = {..._duplicateData, id: Date.now(), date};
  const all = dbGetTransports();
  all.push(newTrip);
  dbSaveTransports(all);

  closeDupModal();
  showToast('✅ Trip duplicated!');
  renderCalendar();
  if (document.getElementById('screen-stats').classList.contains('active')) renderStats();
}

// ── CALENDAR ──────────────────────────────────────────────────────────
function changeCalYear(d) {
  calYear += d;
  document.getElementById('cal-year-lbl').textContent = calYear;
  renderCalendar();
}

function renderCalendar() {
  buildMonthBar('cal-month-bar', calMonth, m => { calMonth = m; renderCalendar(); });
  scrollToActiveMonth('cal-month-bar', calMonth);

  const sejours    = dbGetSejoursForYear(calYear);
  const dayMap     = buildDayMap(sejours);
  const transMap   = buildTransportMap(calYear);
  const today      = todayStr();
  const daysCount  = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow   = new Date(calYear, calMonth, 1).getDay();
  const offset     = firstDow === 0 ? 6 : firstDow - 1;

  const headers = DAY_HEADERS.map((h, i) =>
    `<span class="week-hdr ${i >= 5 ? 'we' : ''}">${h}</span>`).join('');

  let cells = '';
  for (let i = 0; i < offset; i++) cells += `<div class="day empty"></div>`;
  for (let d = 1; d <= daysCount; d++) {
    const ds    = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const iso   = dayMap[ds];
    const modes = transMap[ds] || [];
    const colIdx = (offset + d - 1) % 7;
    const isWe   = colIdx >= 5;

    // Build emoji indicators (max 3, show last ones if overflow)
    let modeEmojis = '';
    if (modes.length > 0) {
      const MAX_EMOJIS = 3;
      const shown = modes.length > MAX_EMOJIS ? modes.slice(-MAX_EMOJIS) : modes;
      const overflow = modes.length > MAX_EMOJIS ? `<span class="day-emoji-more">+${modes.length - MAX_EMOJIS}</span>` : '';
      modeEmojis = `<div class="day-emojis">${overflow}${shown.map(m => `<span class="day-emoji">${MODE_ICONS[m]||'🔖'}</span>`).join('')}</div>`;
    }

    cells += `
      <div class="day ${iso ? 'has-country' : ''} ${ds === today ? 'today' : ''} ${ds === selectedCalDate ? 'selected-day' : ''}"
           onclick="selectCalDay('${ds}','${iso || ''}')">
        <span class="day-num ${iso ? 'active' : ''} ${isWe ? 'we' : ''}">${d}</span>
        ${iso ? `<span class="day-flag">${getFlagEmoji(iso)}</span>` : ''}
        ${modeEmojis}
      </div>`;
  }

  document.getElementById('calendar-month-view').innerHTML = `
    <div class="month-box">
      <div class="month-title">${MONTHS_EN[calMonth].toUpperCase()} ${calYear}</div>
      <div class="week-headers">${headers}</div>
      <div class="days-grid">${cells}</div>
    </div>
    <div id="cal-day-detail"></div>`;

  // Re-render selected day detail if one is selected
  if (selectedCalDate) renderCalDayDetail(selectedCalDate);
}

function buildDayMap(sejours) {
  const map = {};
  sejours.forEach(s => {
    let cur = new Date(s.date_debut + 'T00:00:00');
    const end = new Date(s.date_fin + 'T00:00:00');
    while (cur <= end) {
      const y = cur.getFullYear(), m = String(cur.getMonth()+1).padStart(2,'0'), d = String(cur.getDate()).padStart(2,'0');
      map[`${y}-${m}-${d}`] = s.iso_code;
      cur.setDate(cur.getDate() + 1);
    }
  });
  return map;
}

function buildTransportMap(year) {
  const map = {};
  dbGetTransportsForYear(year).forEach(t => {
    if (!map[t.date]) map[t.date] = [];
    if (!map[t.date].includes(t.mode)) map[t.date].push(t.mode);
  });
  return map;
}

// Calendar day click: show detail panel below calendar, no popup
function selectCalDay(date, iso) {
  selectedCalDate = date;
  renderCalendar(); // re-render to highlight selected cell
}

function renderCalDayDetail(date) {
  const el = document.getElementById('cal-day-detail');
  if (!el) return;

  const sejour     = dbGetPaysForDate(date);
  const transports = dbGetTransportsForDate(date);
  const dayNote    = dbGetDayNote(date);

  let html = `<div class="cal-detail-box">
    <div class="cal-detail-header">
      <span class="cal-detail-date">${fmtDateLong(date)}</span>
      <button class="cal-detail-close" onclick="closeCalDetail()">✕</button>
    </div>`;

  // Day note section
  html += `<div class="cal-detail-note-wrap" id="note-wrap-${date}">`;
  if (dayNote) {
    html += `<div class="cal-detail-note-text" onclick="openNoteEditor('${date}')">${dayNote.replace(/\n/g,'<br>')}</div>`;
  } else {
    html += `<button class="cal-detail-note-empty" onclick="openNoteEditor('${date}')">📝 Add a note for this day…</button>`;
  }
  html += `</div>`;

  // Country stay info
  if (sejour) {
    html += `<div class="cal-detail-stay">
      <span style="font-size:20px">${getFlagEmoji(sejour.iso_code)}</span>
      <span class="cal-detail-country">${getCountryName(sejour.iso_code)}</span>
      <span style="color:var(--muted);font-size:10px">${fmtDate(sejour.date_debut)} → ${fmtDate(sejour.date_fin)}</span>
      <button class="cal-btn-edit" onclick="editStay(${sejour.id},'${sejour.date_debut}','${sejour.date_fin}','${sejour.iso_code}')" title="Edit stay">✏️</button>
      <button class="cal-btn-del" onclick="deleteStay(${sejour.id})" title="Delete stay">🗑️</button>
    </div>`;
  }

  // Transports for this day
  if (transports.length > 0) {
    html += `<div class="cal-detail-section-title">TRIPS</div>`;
    transports.forEach(t => {
      const icon  = MODE_ICONS[t.mode] || '🔖';
      const route = t.origine && t.destination ? `${t.origine} → ${t.destination}` : (t.origine || t.destination || t.mode);
      const co2   = calculateCO2(t);
      html += `
        <div class="cal-detail-trip" onclick="openTripDetail(${t.id})">
          <span class="cal-detail-trip-icon">${icon}</span>
          <div class="cal-detail-trip-info">
            <div class="cal-detail-trip-route">${route}</div>
            <div class="cal-detail-trip-meta">${t.distance ? Math.round(t.distance)+'km' : ''} ${co2 > 0 ? '· '+Math.round(co2)+' kgCO2e' : ''}</div>
          </div>
          <button class="cal-btn-edit" onclick="event.stopPropagation();openEditTransport('${date}',${t.id})" title="Edit">✏️</button>
          <button class="cal-btn-del" onclick="event.stopPropagation();deleteTransport(${t.id},'${date}')" title="Delete">🗑️</button>
        </div>`;
    });
  } else if (!sejour && !dayNote) {
    html += `<div style="color:var(--dim);font-size:12px;padding:8px 0;">No data for this day.</div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
}

// Note editor inline
function openNoteEditor(date) {
  const current = dbGetDayNote(date);
  const wrap = document.getElementById(`note-wrap-${date}`);
  if (!wrap) return;
  wrap.innerHTML = `
    <textarea class="cal-note-editor" id="note-editor-${date}" placeholder="Write your note for this day…">${current}</textarea>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button class="btn-cancel" style="flex:1;padding:8px;font-size:12px" onclick="cancelNoteEditor('${date}')">Cancel</button>
      <button class="btn-save"   style="flex:2;padding:8px;font-size:12px" onclick="saveNoteEditor('${date}')">Save note</button>
    </div>`;
  document.getElementById(`note-editor-${date}`)?.focus();
}

function saveNoteEditor(date) {
  const text = document.getElementById(`note-editor-${date}`)?.value || '';
  dbSetDayNote(date, text);
  renderCalDayDetail(date);
  showToast(text.trim() ? '📝 Note saved' : '🗑️ Note deleted');
}

function cancelNoteEditor(date) {
  renderCalDayDetail(date);
}

function closeCalDetail() {
  selectedCalDate = null;
  const el = document.getElementById('cal-day-detail');
  if (el) el.innerHTML = '';
  renderCalendar();
}

function deleteStay(id) {
  if (!confirm('Delete this stay?')) return;
  dbDeleteSejour(id);
  selectedCalDate = null;
  renderCalendar();
  showToast('🗑️ Stay deleted');
}

function editStay(id, d1, d2, iso) {
  stayStart = d1; stayEnd = d2;
  updateStayDateDisplay();
  document.getElementById('stay-country-select').value = iso;
  document.getElementById('stay-modal').classList.add('open');
  // Store editing id
  document.getElementById('stay-modal').dataset.editId = id;
}

function deleteTransport(id, date) {
  if (!confirm('Delete this trip?')) return;
  dbDeleteTransport(id);
  renderCalDayDetail(date);
  renderCalendar();
  showToast('🗑️ Trip deleted');
}

function openEditTransport(date, id) {
  const t = dbGetTransports().find(x => x.id === id);
  if (!t) return;
  editingTransportId = id;
  openTransportModal(date, dbGetPaysForDate(date)?.iso_code || '');
  // Pre-fill form with existing trip data
  currentMode = t.mode;
  buildModeGrid();
  document.getElementById('tr-from').value = t.origine || '';
  document.getElementById('tr-to').value   = t.destination || '';
  document.getElementById('tr-km').value   = t.distance || '';
  document.getElementById('tr-notes').value = t.notes || '';
  updateTransportFields(currentMode);
  setDetailFieldValues(t.d1, t.d2, t.d3);
  // Remove this trip from pending (will be re-added on save)
  pendingRows = pendingRows.filter(r => r.id !== id);
}

// ── STAY MODAL ────────────────────────────────────────────────────────
function openStayModal() {
  if (selectedCalDate) {
    stayStart = selectedCalDate;
    stayEnd   = selectedCalDate;
    updateStayDateDisplay();
  } else {
    setDefaultStayDates();
  }
  delete document.getElementById('stay-modal').dataset.editId;
  document.getElementById('stay-modal').classList.add('open');
}
function closeStayModal() {
  document.getElementById('stay-modal').classList.remove('open');
  delete document.getElementById('stay-modal').dataset.editId;
}

function updateStayDateDisplay() {
  document.getElementById('stay-start-display').textContent = fmtDate(stayStart);
  document.getElementById('stay-end-display').textContent   = fmtDate(stayEnd);
  if (stayStart && stayEnd && stayStart <= stayEnd) {
    const n = nbDays(stayStart, stayEnd);
    document.getElementById('stay-nb-days').textContent = `${n} day${n > 1 ? 's' : ''}`;
  }
}

function saveStay() {
  if (!stayStart || !stayEnd || stayStart > stayEnd) { showToast('❌ Invalid dates', true); return; }
  const iso = document.getElementById('stay-country-select').value;
  const editId = document.getElementById('stay-modal').dataset.editId;
  if (editId) {
    dbDeleteSejour(parseInt(editId));
  }
  dbAddSejour(stayStart, stayEnd, iso);
  const n = nbDays(stayStart, stayEnd);
  showToast(`✅ ${n} day${n > 1 ? 's' : ''} in ${getCountryName(iso)}`);
  closeStayModal();
  renderCalendar();
}

// ── DATE PICKER ───────────────────────────────────────────────────────
function openDatePicker(target) {
  datePickerTarget = target;
  const labels = { 'stay-start':'Start date', 'stay-end':'End date' };
  document.getElementById('date-modal-title').textContent = labels[target] || 'Select date';
  document.getElementById('date-picker-input').value = target === 'stay-start' ? stayStart : stayEnd;
  document.getElementById('date-modal').classList.add('open');
}
function closeDateModal() { document.getElementById('date-modal').classList.remove('open'); }
function confirmDatePicker() {
  const val = document.getElementById('date-picker-input').value;
  if (!val) { closeDateModal(); return; }
  if (datePickerTarget === 'stay-start') {
    stayStart = val;
    if (stayEnd < stayStart) stayEnd = stayStart;
  } else {
    stayEnd = val;
    if (stayStart > stayEnd) stayStart = stayEnd;
  }
  updateStayDateDisplay();
  closeDateModal();
}

// ── TRANSPORT MODAL ───────────────────────────────────────────────────
function buildModeGrid() {
  const grid = document.getElementById('mode-grid');
  grid.innerHTML = MODES.map(m => `
    <div class="mode-btn ${m.id === currentMode ? 'active' : ''}" id="modeBtn-${m.id}" onclick="selectMode('${m.id}')">
      <div class="mode-btn-icon">${m.icon}</div>
      <div class="mode-btn-lbl">${m.label}</div>
    </div>`).join('');
}

function selectMode(modeId) {
  currentMode = modeId;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('modeBtn-' + modeId)?.classList.add('active');
  updateTransportFields(modeId);
}

function updateTransportFields(modeId) {
  const fields = TRANSPORT_FIELDS[modeId] || [];
  const detailsWrap = document.getElementById('tr-details-wrap');
  const showDetails = modeId !== 'Walk' && modeId !== 'Bike';
  detailsWrap.style.display = showDetails ? '' : 'none';

  // Rebuild detail fields dynamically
  const container = document.getElementById('tr-details-fields');
  container.innerHTML = fields.filter(f => f.label).map(f => {
    if (f.type === 'select') {
      return `<div class="select-wrap tr-detail-select">
        <select id="tr-field-${f.key}" class="inp" style="width:100%;background:var(--bg2);color:var(--text)">
          ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>
      </div>`;
    }
    return `<input class="inp flex" id="tr-field-${f.key}" placeholder="${f.label}">`;
  }).join('');
}

function setDetailFieldValues(d1, d2, d3) {
  const vals = { d1, d2, d3 };
  ['d1','d2','d3'].forEach(k => {
    const el = document.getElementById('tr-field-' + k);
    if (el) el.value = vals[k] || '';
  });
}

function getDetailFieldValues() {
  return {
    d1: document.getElementById('tr-field-d1')?.value || '',
    d2: document.getElementById('tr-field-d2')?.value || '',
    d3: document.getElementById('tr-field-d3')?.value || '',
  };
}

function openTransportModal(date, iso) {
  currentModalDate = date;
  editingTransportId = null;
  pendingRows = [];

  document.getElementById('transport-modal-title').textContent = fmtDateLong(date);
  const badge = document.getElementById('transport-country-badge');
  if (iso) { badge.textContent = `${getFlagEmoji(iso)} ${getCountryName(iso)}`; badge.style.display = ''; }
  else      { badge.style.display = 'none'; }

  currentMode = 'Plane';
  buildModeGrid();
  clearTransportForm();
  updateTransportFields(currentMode);

  const existing = dbGetTransportsForDate(date);
  pendingRows = existing.map(t => ({...t}));
  renderPendingRows();

  document.getElementById('transport-modal').classList.add('open');
}

function closeTransportModal() {
  document.getElementById('transport-modal').classList.remove('open');
  editingTransportId = null;
}

function clearTransportForm() {
  ['tr-from','tr-to','tr-km','tr-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  updateTransportFields(currentMode);
}

function commitTransportRow() {
  const from  = document.getElementById('tr-from').value.trim();
  const to    = document.getElementById('tr-to').value.trim();
  const km    = document.getElementById('tr-km').value;
  const notes = document.getElementById('tr-notes').value.trim();

  if (!from && !to && !km && currentMode !== 'Walk' && currentMode !== 'Bike') {
    showToast('Fill in Route (From/To) or km', true); return;
  }
  const dVals = getDetailFieldValues();
  const row = {
    id: editingTransportId || Date.now(),
    mode: currentMode,
    origine: from, destination: to,
    distance: parseFloat(km) || 0,
    d1: dVals.d1, d2: dVals.d2, d3: dVals.d3,
    notes,
  };
  if (editingTransportId) {
    const idx = pendingRows.findIndex(r => r.id === editingTransportId);
    if (idx >= 0) pendingRows[idx] = row; else pendingRows.push(row);
    editingTransportId = null;
  } else {
    pendingRows.push(row);
  }
  clearTransportForm();
  renderPendingRows();
}

function renderPendingRows() {
  const wrap = document.getElementById('multi-transport-list');
  if (pendingRows.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<div class="multi-transport-list">` +
    pendingRows.map(r => {
      const icon  = MODE_ICONS[r.mode] || '🔖';
      const route = r.origine && r.destination ? `${r.origine} → ${r.destination}` : (r.origine || r.destination || r.mode);
      const meta  = [r.distance ? `${r.distance}km` : '', r.d1].filter(Boolean).join(' · ');
      return `
        <div class="mtr-item">
          <span class="mtr-icon">${icon}</span>
          <div class="mtr-info">
            <div class="mtr-route">${route}</div>
            ${meta ? `<div class="mtr-meta">${meta}</div>` : ''}
            ${r.notes ? `<div class="mtr-meta" style="color:var(--dim);font-style:italic">${r.notes}</div>` : ''}
          </div>
          <button class="mtr-edit" onclick="editPendingRow(${r.id})">✏️</button>
          <button class="mtr-del" onclick="removePendingRow(${r.id})">✕</button>
        </div>`;
    }).join('') + `</div>`;
}

function editPendingRow(id) {
  const r = pendingRows.find(x => x.id === id);
  if (!r) return;
  editingTransportId = id;
  currentMode = r.mode;
  buildModeGrid();
  updateTransportFields(currentMode);
  document.getElementById('tr-from').value = r.origine || '';
  document.getElementById('tr-to').value   = r.destination || '';
  document.getElementById('tr-km').value   = r.distance || '';
  document.getElementById('tr-notes').value = r.notes || '';
  setDetailFieldValues(r.d1, r.d2, r.d3);
}

function removePendingRow(id) {
  pendingRows = pendingRows.filter(r => r.id !== id);
  renderPendingRows();
}

function saveTransports() {
  const from  = document.getElementById('tr-from').value.trim();
  const to    = document.getElementById('tr-to').value.trim();
  const km    = document.getElementById('tr-km').value;
  if (from || to || km) commitTransportRow();

  dbSaveTransportsForDate(currentModalDate, pendingRows);
  closeTransportModal();
  renderCalendar();
  showToast('✅ Saved');
  if (document.getElementById('screen-stats').classList.contains('active')) renderStats();
}

// ── TRIP DETAIL POPUP ─────────────────────────────────────────────────
function openTripDetail(id) {
  const t = dbGetTransports().find(x => x.id === id);
  if (!t) return;
  const icon  = MODE_ICONS[t.mode] || '🔖';
  const route = t.origine && t.destination ? `${t.origine} → ${t.destination}` : (t.origine || t.destination || t.mode);
  const co2   = calculateCO2(t);
  const fields = TRANSPORT_FIELDS[t.mode] || [];

  let detailRows = '';
  const vals = { d1: t.d1, d2: t.d2, d3: t.d3 };
  fields.filter(f => f.label && vals[f.key]).forEach(f => {
    detailRows += `<div class="trip-detail-row"><span class="trip-detail-lbl">${f.label}</span><span class="trip-detail-val">${vals[f.key]}</span></div>`;
  });
  if (t.distance) detailRows += `<div class="trip-detail-row"><span class="trip-detail-lbl">Distance</span><span class="trip-detail-val">${Math.round(t.distance)} km</span></div>`;
  if (co2 > 0)    detailRows += `<div class="trip-detail-row"><span class="trip-detail-lbl">CO2e</span><span class="trip-detail-val">${Math.round(co2)} kg</span></div>`;

  document.getElementById('trip-detail-content').innerHTML = `
    <div class="trip-detail-icon">${icon}</div>
    <div class="trip-detail-route">${route}</div>
    <div class="trip-detail-date">${fmtDateLong(t.date)} · ${t.mode}</div>
    <div class="trip-detail-fields">${detailRows}</div>
    ${t.notes ? `<div class="trip-detail-notes"><span class="trip-detail-lbl">Notes</span><div class="trip-detail-notes-text">${t.notes}</div></div>` : ''}
    <div class="modal-actions" style="margin-top:14px">
      <button class="btn-cancel" onclick="closeTripDetail()">Close</button>
      <button class="btn-dup"    onclick="duplicateTransport(${t.id})">⎘ Duplicate</button>
      <button class="btn-save"   onclick="closeTripDetail();openEditTransport('${t.date}',${t.id})">✏️ Edit</button>
    </div>`;
  document.getElementById('trip-detail-modal').classList.add('open');
}
function closeTripDetail() { document.getElementById('trip-detail-modal').classList.remove('open'); }

// ── LOG ───────────────────────────────────────────────────────────────
function changeLogYear(d) {
  logYear += d;
  document.getElementById('log-year-lbl').textContent = logYear;
  renderLog();
}

function renderLog() {
  buildMonthBar('log-month-bar', logMonth, m => { logMonth = m; renderLog(); });
  scrollToActiveMonth('log-month-bar', logMonth);

  const y = String(logYear);
  const m = String(logMonth + 1).padStart(2, '0');
  const lastDay = String(new Date(logYear, logMonth + 1, 0).getDate()).padStart(2, '0');
  const monthStart = `${y}-${m}-01`;
  const monthEnd   = `${y}-${m}-${lastDay}`;

  const entries = [];

  dbGetSejours().forEach(s => {
    const start = s.date_debut > monthStart ? s.date_debut : monthStart;
    const end   = s.date_fin   < monthEnd   ? s.date_fin   : monthEnd;
    if (start > end) return;
    entries.push({ type:'stay', date:start, dateEnd:end, iso:s.iso_code, id:s.id,
      origStart: s.date_debut, origEnd: s.date_fin });
  });

  dbGetTransports().filter(t => t.date >= monthStart && t.date <= monthEnd).forEach(t => {
    entries.push({ type:'transport', date:t.date, data:t });
  });

  entries.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    // Same date: transport before stay
    if (a.type === b.type) return 0;
    return a.type === 'transport' ? -1 : 1;
  });

  const view = document.getElementById('log-month-view');
  if (entries.length === 0) {
    view.innerHTML = `<div class="log-empty">No entries for ${MONTHS_EN[logMonth]} ${logYear}</div>`;
    return;
  }

  const rows = entries.map(e => {
    if (e.type === 'stay') {
      const flag = getFlagEmoji(e.iso);
      const name = getCountryName(e.iso);
      // Show actual dates but indicate if it continues across month boundary
      const d1str = e.date === monthStart && e.origStart < monthStart
        ? `1/${m}`
        : fmtDateShort(e.date);
      const d2str = e.dateEnd === monthEnd && e.origEnd > monthEnd
        ? `${lastDay}/${m}`
        : fmtDateShort(e.dateEnd);
      const days = nbDays(e.date, e.dateEnd);
      return `<tr class="row-stay">
        <td>${flag}</td>
        <td colspan="2"><strong style="color:var(--text)">${name}</strong><br><span style="font-size:10px">${d1str} → ${d2str}</span></td>
        <td class="log-km">${days}d</td>
        <td>—</td>
      </tr>`;
    } else {
      const t    = e.data;
      const icon = MODE_ICONS[t.mode] || '🔖';
      const route = t.origine && t.destination ? `${t.origine} → ${t.destination}` : (t.origine || t.destination || '—');
      const co2  = calculateCO2(t);
      return `<tr class="row-transport log-row-clickable" onclick="openTripDetail(${t.id})">
        <td>${icon}</td>
        <td style="font-size:10px;color:var(--muted)">${fmtDateShort(t.date)}</td>
        <td style="font-size:11px">${route}</td>
        <td class="log-km">${t.distance ? Math.round(t.distance).toLocaleString('en')+' km' : '—'}</td>
        <td class="log-co2">${co2 > 0 ? Math.round(co2)+' kgCO2e' : '—'}</td>
      </tr>`;
    }
  }).join('');

  view.innerHTML = `
    <div class="log-month-title">${MONTHS_EN[logMonth].toUpperCase()} ${logYear}</div>
    <table class="log-table">
      <thead><tr>
        <th></th><th>DATE</th><th>DETAILS</th><th>KM / DAYS</th><th>kgCO2e</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── DATA / EXPORT ─────────────────────────────────────────────────────
function renderGlobalStats() {
  const s = computeStats(dbGetTransports(), dbGetSejours());
  const days = dbGetSejours().reduce((a, sej) => a + nbDays(sej.date_debut, sej.date_fin), 0);
  const countries = Object.keys(s.countryCounts).length;
  document.getElementById('global-stats-card').innerHTML = `
    <div class="global-stat-row"><span class="global-stat-lbl">Total tracked days</span><span class="global-stat-val">${days} days</span></div>
    <div class="global-stat-row"><span class="global-stat-lbl">Countries visited</span><span class="global-stat-val">${countries}</span></div>
    <div class="global-stat-row"><span class="global-stat-lbl">Total distance</span><span class="global-stat-val">${Math.round(s.totalKm).toLocaleString('en')} km</span></div>
    <div class="global-stat-row"><span class="global-stat-lbl">Total kgCO2e (transport)</span><span class="global-stat-val">${Math.round(s.totalCo2).toLocaleString('en')} kg</span></div>
    <div class="global-stat-row"><span class="global-stat-lbl">Trips recorded</span><span class="global-stat-val">${dbGetTransports().length}</span></div>
  `;
}

// ── DELETE ALL DATA ───────────────────────────────────────────────────
const DELETE_PHRASE = 'Tyé un tigre';

function openDeleteAllModal() {
  document.getElementById('delete-confirm-input').value = '';
  document.getElementById('delete-phrase-hint').textContent = '';
  document.getElementById('btn-delete-confirm').disabled = true;
  document.getElementById('delete-all-modal').classList.add('open');
}

function closeDeleteAllModal() {
  document.getElementById('delete-all-modal').classList.remove('open');
}

function checkDeletePhrase() {
  const val = document.getElementById('delete-confirm-input').value;
  const ok = val === DELETE_PHRASE;
  document.getElementById('btn-delete-confirm').disabled = !ok;
  document.getElementById('delete-phrase-hint').textContent = val.length > 0 && !ok ? '❌ Phrase does not match' : '';
}

function loadDemoData() {
  dbLoadDemo();
  showToast('🗂️ Demo data loaded!');
  renderStats();
  renderGlobalStats();
}

function confirmDeleteAll() {
  const val = document.getElementById('delete-confirm-input').value;
  if (val !== DELETE_PHRASE) return;
  dbDeleteAll();
  closeDeleteAllModal();
  showToast('🗑️ All data deleted');
  renderStats();
  renderCalendar();
  renderLog();
  renderGlobalStats();
}

async function exportData() {
  const data     = dbExport();
  const json     = JSON.stringify(data, null, 2);
  const fileName = `trackprint-${todayStr()}.json`;

  // ── Android / Capacitor ───────────────────────────────────────────────
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    try {
      const Filesystem = window.Capacitor.Plugins.Filesystem;
      const Share      = window.Capacitor.Plugins.Share;
      const CACHE      = 'CACHE'; // string enum in Capacitor v8

      await Filesystem.writeFile({ path: fileName, data: json, directory: CACHE, encoding: 'utf8' });
      const { uri } = await Filesystem.getUri({ path: fileName, directory: CACHE });
      await Share.share({ title: 'TrackPrint export', url: uri, dialogTitle: 'Save or share your data' });

      showToast('📤 Export ready!');
    } catch (err) {
      showToast('❌ Export failed: ' + err.message, true);
    }
    return;
  }

  // ── Browser fallback ──────────────────────────────────────────────────
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📤 Export downloaded!');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      const nbS = data.sejours?.length ?? '?';
      const nbT = data.transports?.length ?? '?';
      if (!confirm(`Import ${nbS} stays and ${nbT} transports?\n⚠️ Current data will be replaced.`)) return;
      dbImport(data);
      showToast(`✅ Imported — ${nbS} stays, ${nbT} transports`);
      renderStats();
      renderCalendar();
      renderLog();
      renderGlobalStats();
    } catch(err) { showToast('❌ Invalid file: ' + err.message, true); }
  };
  fr.readAsText(file);
  event.target.value = '';
}

// ── FAB buttons ───────────────────────────────────────────────────────
function openTransportFromFab() {
  const date = selectedCalDate || todayStr();
  const sejour = dbGetPaysForDate(date);
  openTransportModal(date, sejour?.iso_code || '');
}

function openNoteFromFab() {
  const date = selectedCalDate || todayStr();
  if (!selectedCalDate) {
    selectedCalDate = date;
    renderCalendar();
  }
  setTimeout(() => {
    openNoteEditor(date);
    document.getElementById('cal-day-detail')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 100);
}
