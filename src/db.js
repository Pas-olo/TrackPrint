// db.js — persistence layer (localStorage)
const DB_SEJOURS    = 'tt_sejours_v3';
const DB_TRANSPORTS = 'tt_transports_v3';
let _nextId = 200;

function dbInit() {
  const ids = [...dbGetSejours(), ...dbGetTransports()].map(x => x.id).filter(Boolean);
  _nextId = ids.length ? Math.max(...ids) + 1 : 200;
}

function dbLoadDemo() {
  localStorage.setItem(DB_SEJOURS,    JSON.stringify(DEMO_SEJOURS));
  localStorage.setItem(DB_TRANSPORTS, JSON.stringify(DEMO_TRANSPORTS));
  const ids = [...DEMO_SEJOURS, ...DEMO_TRANSPORTS].map(x => x.id).filter(Boolean);
  _nextId = ids.length ? Math.max(...ids) + 1 : 200;
}

function nid() { return _nextId++; }

// ── Sejours ──────────────────────────────────────────────────────────
function dbGetSejours() {
  try { return JSON.parse(localStorage.getItem(DB_SEJOURS)) || []; } catch { return []; }
}
function _saveSejours(s) { localStorage.setItem(DB_SEJOURS, JSON.stringify(s)); }

function dbGetSejoursForYear(year) {
  const y = String(year);
  return dbGetSejours().filter(s =>
    s.date_debut <= `${y}-12-31` && s.date_fin >= `${y}-01-01`
  );
}
function dbGetPaysForDate(date) {
  return dbGetSejours().find(s => s.date_debut <= date && s.date_fin >= date) || null;
}

function _localDateStr(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function dbAddSejour(d1, d2, iso) {
  let s = dbGetSejours();
  // Remove fully-contained stays, trim overlapping ones, split engulfed ones
  s = s.filter(x => !(x.date_debut >= d1 && x.date_fin <= d2));
  s = s.map(x => {
    if (x.date_debut < d1 && x.date_fin >= d1 && x.date_fin <= d2) {
      const dt = new Date(d1 + 'T00:00:00'); dt.setDate(dt.getDate()-1);
      return {...x, date_fin: _localDateStr(dt)};
    }
    return x;
  });
  s = s.map(x => {
    if (x.date_debut >= d1 && x.date_debut <= d2 && x.date_fin > d2) {
      const dt = new Date(d2 + 'T00:00:00'); dt.setDate(dt.getDate()+1);
      return {...x, date_debut: _localDateStr(dt)};
    }
    return x;
  });
  const eng = s.find(x => x.date_debut < d1 && x.date_fin > d2);
  if (eng) {
    s = s.filter(x => x.id !== eng.id);
    const dl = new Date(d1 + 'T00:00:00'); dl.setDate(dl.getDate()-1);
    const dr = new Date(d2 + 'T00:00:00'); dr.setDate(dr.getDate()+1);
    s.push({id:nid(), date_debut:eng.date_debut, date_fin:_localDateStr(dl), iso_code:eng.iso_code});
    s.push({id:nid(), date_debut:_localDateStr(dr), date_fin:eng.date_fin, iso_code:eng.iso_code});
  }
  s.push({id:nid(), date_debut:d1, date_fin:d2, iso_code:iso});
  s = s.filter(x => x.date_debut <= x.date_fin);
  s.sort((a,b) => a.date_debut.localeCompare(b.date_debut));
  _saveSejours(s);
}

function dbDeleteSejour(id) { _saveSejours(dbGetSejours().filter(s => s.id !== id)); }

// ── Transports ──────────────────────────────────────────────────────
function dbGetTransports() {
  try { return JSON.parse(localStorage.getItem(DB_TRANSPORTS)) || []; } catch { return []; }
}
function _saveTransports(t) { localStorage.setItem(DB_TRANSPORTS, JSON.stringify(t)); }
function dbSaveTransports(t) { _saveTransports(t); }

function dbGetTransportsForYear(year) {
  return dbGetTransports().filter(t => t.date.startsWith(String(year)));
}
function dbGetTransportsForDate(date) {
  return dbGetTransports().filter(t => t.date === date);
}
function dbSaveTransportsForDate(date, rows) {
  let all = dbGetTransports().filter(t => t.date !== date);
  rows.forEach(r => {
    if (r.origine?.trim() || r.destination?.trim() || r.mode === 'Walk' || r.mode === 'Bike') {
      all.push({
        // Preserve small sequential IDs (demo/nid); reassign Date.now()-style IDs (> ~Nov 2023)
        id: (r.id && r.id < 1700000000000) ? r.id : nid(),
        date, mode:r.mode,
        origine:r.origine||'', destination:r.destination||'',
        distance:parseFloat(r.distance)||0,
        d1:r.d1||'', d2:r.d2||'', d3:r.d3||'',
        notes:r.notes||''
      });
    }
  });
  _saveTransports(all);
}
function dbDeleteTransport(id) { _saveTransports(dbGetTransports().filter(t => t.id !== id)); }

// ── Day Notes ────────────────────────────────────────────────────────
const DB_DAYNOTES = 'tt_daynotes_v3';
function dbGetDayNotes() {
  try { return JSON.parse(localStorage.getItem(DB_DAYNOTES)) || {}; } catch { return {}; }
}
function dbGetDayNote(date) { return dbGetDayNotes()[date] || ''; }
function dbSetDayNote(date, text) {
  const notes = dbGetDayNotes();
  if (text.trim()) notes[date] = text.trim();
  else delete notes[date];
  localStorage.setItem(DB_DAYNOTES, JSON.stringify(notes));
}

// ── Import / Export ──────────────────────────────────────────────────
function dbDeleteAll() {
  localStorage.removeItem(DB_SEJOURS);
  localStorage.removeItem(DB_TRANSPORTS);
  localStorage.removeItem(DB_DAYNOTES);
  _nextId = 200;
}
function dbExport() {
  return { version:4, exportDate:new Date().toISOString(), sejours:dbGetSejours(), transports:dbGetTransports(), dayNotes:dbGetDayNotes() };
}
function dbImport(data) {
  if (!data.sejours || !data.transports) throw new Error('Invalid format');
  _saveSejours(data.sejours);
  _saveTransports(data.transports);
  if (data.dayNotes) localStorage.setItem(DB_DAYNOTES, JSON.stringify(data.dayNotes));
  const ids = [...data.sejours, ...data.transports].map(x=>x.id).filter(Boolean);
  _nextId = ids.length ? Math.max(...ids)+1 : 200;
}
