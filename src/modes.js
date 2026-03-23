// modes.js — Transport mode configuration

const MODES = [
  { id:'Plane', icon:'✈️',  label:'Plane'  },
  { id:'Train', icon:'🚆',  label:'Train'  },
  { id:'Car',   icon:'🚗',  label:'Car'    },
  { id:'Bus',   icon:'🚌',  label:'Bus'    },
  { id:'Boat',  icon:'⛵',  label:'Boat'   },
  { id:'Bike',  icon:'🚴',  label:'Bike'   },
  { id:'Walk',  icon:'🚶',  label:'Walk'   },
  { id:'Other', icon:'🔖',  label:'Other'  },
];

const MODE_ICONS = Object.fromEntries(MODES.map(m => [m.id, m.icon]));

// ── Car types — shared with co2.js for emission calc ──────────────
// conso: L/100km (thermal) or kWh/100km (electric)
const CAR_TYPES = {
  'Sedan':    { fuel:'thermal', conso:7  },
  'Hybrid':   { fuel:'thermal', conso:4  },
  'SUV':      { fuel:'thermal', conso:9  },
  'Van':      { fuel:'thermal', conso:10 },
  'Motorcycle':{ fuel:'thermal', conso:4  },
  'Small EV': { fuel:'electric', conso:15 },
  'SUV EV':   { fuel:'electric', conso:22 },
  'Van EV':   { fuel:'electric', conso:30 },
};

// ── Detail fields per mode ─────────────────────────────────────────
const TRANSPORT_FIELDS = {
  Plane: [
    { label: 'Aircraft type', type: 'text',   key: 'd1' },
    { label: 'Flight no.',    type: 'text',   key: 'd2' },
    { label: 'Seat class',    type: 'select', key: 'd3',
      options: ['Economy', 'Premium Economy', 'Business', 'First'] },
  ],
  Train: [
    { label: 'Train type', type: 'text', key: 'd1' },
    { label: 'Train no.',  type: 'text', key: 'd2' },
    { label: 'Operator',   type: 'text', key: 'd3' },
  ],
  Car: [
    { label: 'Passengers', type: 'text',   key: 'd1', placeholder: '1' },
    { label: 'Car type',   type: 'select', key: 'd2',
      options: Object.keys(CAR_TYPES) },
    // d3 intentionally unused for car (no manual consumption)
  ],
  Bus: [
    { label: 'Bus type', type: 'select', key: 'd1',
      options: ['Coach', 'Sleeper', 'City bus', 'Minibus'] },
    { label: 'Company',    type: 'text', key: 'd2' },
    { label: 'Extra info', type: 'text', key: 'd3' },
  ],
  Boat: [
    { label: 'Passenger type', type: 'select', key: 'd1',
      options: ['Foot passenger', 'Car passenger'] },
    { label: 'Vessel name', type: 'text', key: 'd2' },
  ],
  Bike: [],
  Walk: [],
  Other: [
    { label: 'Description',                    type: 'text', key: 'd1' },
    { label: 'Emission factor (kgCO2e/km)',    type: 'text', key: 'd2' },
  ],
};

const MODE_COLORS = {
  Plane:'#4e73df', Train:'#1cc88a', Car:'#f6c23e', Bus:'#36b9cc',
  Boat:'#e74a3b',  Bike:'#9b59b6', Walk:'#1abc9c', Other:'#888780'
};
const PIE_COLORS = ['#4e73df','#1cc88a','#f6c23e','#e74a3b','#36b9cc','#9b59b6','#e67e22','#1abc9c','#e91e63','#ff9800'];

const MONTHS_EN    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS  = ['M','T','W','T','F','S','S'];
