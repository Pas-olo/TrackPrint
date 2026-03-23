// co2.js — emission calculations
// Sources: DEFRA 2025 (plane, train, boat, thermal FE), Ember 2024 (electricity)
// Car types are defined in modes.js (CAR_TYPES) and reused here.

// ── Plane — FE in kgCO2e/km, radiative forcing included (DEFRA 2025) ─
const PLANE_FE = {
  short: { Economy: 0.12576, 'Premium Economy': 0.12576, Business: 0.18863, First: 0.18863 },
  long:  { Economy: 0.11704, 'Premium Economy': 0.18726, Business: 0.33940, First: 0.46814 },
};

// ── Train ─────────────────────────────────────────────────────────────
const TRAIN_FE = 0.00446; // kgCO2e/km, international average (DEFRA 2025)

// ── Car ───────────────────────────────────────────────────────────────
// Consumption data lives in CAR_TYPES (modes.js): { fuel, conso (L or kWh / 100km) }
const THERMAL_FE = 3.1; // kgCO2e/L — average fuel incl. upstream (DEFRA 2025)

// ── Bus ───────────────────────────────────────────────────────────────
const BUS_FE = {
  'Coach':    0.03,
  'Sleeper':  0.08,
  'City bus': 0.10,
  'Minibus':  0.05,
};

// ── Boat ──────────────────────────────────────────────────────────────
const BOAT_FE = {
  'Foot passenger': 0.01871,
  'Car passenger':  0.12933,
};

// ── Main calculation ──────────────────────────────────────────────────
function calculateCO2(t, countryIso) {
  const dist = parseFloat(t.distance) || 0;
  if (dist === 0) return 0;

  switch (t.mode) {
    case 'Plane': {
      const haul   = dist >= 3700 ? 'long' : 'short';
      const cls    = t.d3 || 'Economy';
      const feMap  = PLANE_FE[haul];
      const fe     = feMap[cls] ?? feMap['Economy'];
      return dist * fe;
    }

    case 'Train':
      return dist * TRAIN_FE;

    case 'Car': {
      const carType = t.d2 || 'Sedan';
      const spec    = CAR_TYPES[carType] || CAR_TYPES['Sedan'];
      const pax     = Math.max(1, parseInt(t.d1) || 1);
      if (spec.fuel === 'thermal') {
        return (dist * (spec.conso / 100) * THERMAL_FE) / pax;
      } else {
        const iso   = countryIso || dbGetPaysForDate(t.date)?.iso_code || null;
        return (dist * (spec.conso / 100) * getElecFE(iso)) / pax;
      }
    }

    case 'Bus': {
      const busType = t.d1 || 'Coach';
      const fe      = BUS_FE[busType] ?? BUS_FE['Coach'];
      return dist * fe;
    }

    case 'Boat': {
      const cls = t.d1 || 'Foot passenger';
      const fe  = BOAT_FE[cls] ?? BOAT_FE['Foot passenger'];
      return dist * fe;
    }

    case 'Bike':
    case 'Walk':
      return 0;

    case 'Other': {
      const raw = (t.d2 || '').toString().replace(',', '.').trim();
      const fe  = parseFloat(raw);
      if (!raw || isNaN(fe) || fe < 0) return 0;
      return dist * fe;
    }

    default:
      return 0;
  }
}

// ── Stats aggregation ────────────────────────────────────────────────
function computeStats(transports, sejours) {
  let totalKm = 0, totalCo2 = 0;
  transports.forEach(t => {
    totalKm  += parseFloat(t.distance) || 0;
    totalCo2 += calculateCO2(t);
  });

  const countryCounts = {};
  sejours.forEach(s => {
    const days = Math.round((new Date(s.date_fin) - new Date(s.date_debut)) / 86400000) + 1;
    countryCounts[s.iso_code] = (countryCounts[s.iso_code] || 0) + days;
  });

  const kmByMode = {}, co2ByMode = {};
  Object.keys(MODE_COLORS).forEach(m => {
    kmByMode[m]  = new Array(12).fill(0);
    co2ByMode[m] = new Array(12).fill(0);
  });
  transports.forEach(t => {
    const mi = parseInt(t.date.split('-')[1]) - 1;
    if (kmByMode[t.mode] !== undefined) {
      kmByMode[t.mode][mi]  += parseFloat(t.distance) || 0;
      co2ByMode[t.mode][mi] += calculateCO2(t);
    }
  });

  return { totalKm, totalCo2, countryCounts, kmByMode, co2ByMode };
}

// ── Carbon equivalent comparator ──────────────────────────────────────
function findCarbonEquivalent(co2kg) {
  if (!co2kg || co2kg <= 0) return null;
  let best = null, bestDiff = Infinity;
  for (const [iso, annual] of Object.entries(EMISSIONS_DATA)) {
    const diff = Math.abs(annual - co2kg);
    if (diff < bestDiff) { bestDiff = diff; best = { iso, annual }; }
  }
  return best;
}
