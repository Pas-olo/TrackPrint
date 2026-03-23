// demo.js — Demo seed data

const DEMO_SEJOURS = [
  { id:1,  date_debut:'2026-01-01', date_fin:'2026-02-13', iso_code:'FR' },
  { id:2,  date_debut:'2026-02-14', date_fin:'2026-02-16', iso_code:'AD' },
  { id:3,  date_debut:'2026-02-17', date_fin:'2026-03-13', iso_code:'FR' },
  { id:4,  date_debut:'2026-03-14', date_fin:'2026-03-18', iso_code:'CH' },
  { id:5,  date_debut:'2026-03-19', date_fin:'2026-04-24', iso_code:'FR' },
  { id:6,  date_debut:'2026-04-25', date_fin:'2026-04-27', iso_code:'ES' },
  { id:7,  date_debut:'2026-04-28', date_fin:'2026-05-07', iso_code:'FR' },
  { id:8,  date_debut:'2026-05-08', date_fin:'2026-05-15', iso_code:'GB' },
  { id:9,  date_debut:'2026-05-16', date_fin:'2026-06-07', iso_code:'FR' },
  { id:10, date_debut:'2026-06-08', date_fin:'2026-06-10', iso_code:'IT' },
  { id:11, date_debut:'2026-06-11', date_fin:'2026-06-13', iso_code:'IT' },
  { id:12, date_debut:'2026-06-14', date_fin:'2026-06-30', iso_code:'FR' },
];

const DEMO_TRANSPORTS = [

  // ── January: local outings ────────────────────────────────────────────
  { id:101, date:'2026-01-07', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Cazals',                  distance:5,   d1:'', d2:'',      d3:'',        notes:'Morning walk to Cazals, beautiful sunshine.' },
  { id:102, date:'2026-01-10', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Quick drive to Caussade to pick up groceries for the week.' },
  { id:103, date:'2026-01-10', mode:'Car',   origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Back home from Caussade.' },
  { id:104, date:'2026-01-15', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Penne',                   distance:12,  d1:'', d2:'',      d3:'',        notes:'Easy bike ride to Penne, gorgeous views over the gorges.' },
  { id:105, date:'2026-01-22', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Feneyrols',               distance:4,   d1:'', d2:'',      d3:'',        notes:'Short walk to Feneyrols after lunch.' },
  { id:106, date:'2026-01-28', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Back to Caussade — forgot to buy coffee last time.' },
  { id:107, date:'2026-01-28', mode:'Car',   origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Heading home.' },

  // ── February: Andorra weekend ─────────────────────────────────────────
  { id:108, date:'2026-02-07', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Cazals',                  distance:5,   d1:'', d2:'',      d3:'',        notes:'Walk to Cazals to stretch the legs.' },
  { id:109, date:'2026-02-12', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Drive to Caussade for a few errands before the trip.' },
  { id:110, date:'2026-02-12', mode:'Car',   origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Back home.' },
  { id:111, date:'2026-02-14', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Pas-de-la-Case',          distance:220, d1:'4', d2:'Sedan', d3:'',        notes:'Weekend trip with friends to Pas-de-la-Case! Stunning drive through the Pyrenees.' },
  { id:112, date:'2026-02-16', mode:'Car',   origine:'Pas-de-la-Case',          destination:'Saint-Antonin-Noble-Val', distance:220, d1:'4', d2:'Sedan', d3:'',        notes:'Back from the Andorra weekend — great memories (and a duty-free haul).' },

  // ── March: local rides + Geneva trip ─────────────────────────────────
  { id:113, date:'2026-03-05', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Najac',                   distance:22,  d1:'', d2:'',      d3:'',        notes:'Bike ride to Najac, the castle looks incredible from the road.' },
  { id:114, date:'2026-03-12', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Caussade for the Thursday market.' },
  { id:115, date:'2026-03-12', mode:'Car',   origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Back from the market.' },

  // Geneva outbound (Mar 14, four trains in one day)
  { id:116, date:'2026-03-14', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Lexos',                   distance:18,  d1:'', d2:'',      d3:'',        notes:'Early morning bike to Lexos to catch the first train to Geneva.' },
  { id:117, date:'2026-03-14', mode:'Train', origine:'Lexos',                   destination:'Toulouse',                distance:100, d1:'Intercites', d2:'', d3:'FR',  notes:'Train from Lexos to Toulouse, barely anyone on board this early.' },
  { id:118, date:'2026-03-14', mode:'Train', origine:'Toulouse',                destination:'Montpellier',             distance:245, d1:'TGV',        d2:'', d3:'FR',  notes:'TGV to Montpellier — super comfortable, we were flying.' },
  { id:119, date:'2026-03-14', mode:'Train', origine:'Montpellier',             destination:'Lyon Part-Dieu',          distance:305, d1:'TGV',        d2:'', d3:'FR',  notes:'TGV to Lyon, beautiful scenery along the Rhone valley.' },
  { id:120, date:'2026-03-14', mode:'Train', origine:'Lyon Part-Dieu',          destination:'Geneva',                  distance:155, d1:'TGV',        d2:'', d3:'CH',  notes:'Last leg into Geneva, arrived late afternoon. What a day of trains — but the comfort made it effortless!' },

  // Geneva return (Mar 18, reverse route)
  { id:121, date:'2026-03-18', mode:'Train', origine:'Geneva',                  destination:'Lyon Part-Dieu',          distance:155, d1:'TGV',        d2:'', d3:'FR',  notes:'Leaving Geneva — hard to say goodbye to that lake.' },
  { id:122, date:'2026-03-18', mode:'Train', origine:'Lyon Part-Dieu',          destination:'Montpellier',             distance:305, d1:'TGV',        d2:'', d3:'FR',  notes:'TGV Lyon to Montpellier, smooth as ever.' },
  { id:123, date:'2026-03-18', mode:'Train', origine:'Montpellier',             destination:'Toulouse',                distance:245, d1:'TGV',        d2:'', d3:'FR',  notes:'TGV back to Toulouse.' },
  { id:124, date:'2026-03-18', mode:'Train', origine:'Toulouse',                destination:'Lexos',                   distance:100, d1:'Intercites', d2:'', d3:'FR',  notes:'Last train to Lexos, exhausted but happy.' },
  { id:125, date:'2026-03-18', mode:'Bike',  origine:'Lexos',                   destination:'Saint-Antonin-Noble-Val', distance:18,  d1:'', d2:'',      d3:'',        notes:'Night ride back from Lexos — glad to be home.' },

  { id:126, date:'2026-03-26', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Villefranche-de-Rouergue',distance:35,  d1:'', d2:'',      d3:'',        notes:'Big ride all the way to Villefranche-de-Rouergue, well deserved rest afterwards!' },

  // ── April: local outings + Barcelona weekend ──────────────────────────
  { id:127, date:'2026-04-02', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Cazals',                  distance:5,   d1:'', d2:'',      d3:'',        notes:'Spring walk to Cazals, everything is blooming.' },
  { id:128, date:'2026-04-09', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Grocery run to Caussade.' },
  { id:129, date:'2026-04-09', mode:'Car',   origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Back home.' },
  { id:130, date:'2026-04-16', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Vaour',                   distance:8,   d1:'', d2:'',      d3:'',        notes:'Run up to Vaour, tough climb but worth it!' },
  { id:131, date:'2026-04-25', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Lexos',                   distance:18,  d1:'', d2:'',      d3:'',        notes:'Biked to Lexos to catch the train to Barcelona.' },
  { id:132, date:'2026-04-25', mode:'Train', origine:'Lexos',                   destination:'Toulouse',                distance:100, d1:'Intercites', d2:'', d3:'FR',  notes:'Train from Lexos to Toulouse.' },
  { id:133, date:'2026-04-25', mode:'Train', origine:'Toulouse',                destination:'Barcelona',               distance:450, d1:'TGV',        d2:'', d3:'ES',  notes:'TGV to Barcelona for the weekend — long live cross-border trains!' },
  { id:134, date:'2026-04-27', mode:'Train', origine:'Barcelona',               destination:'Toulouse',                distance:450, d1:'TGV',        d2:'', d3:'FR',  notes:'Back from Barcelona, perfect weekend.' },
  { id:135, date:'2026-04-27', mode:'Train', origine:'Toulouse',                destination:'Lexos',                   distance:100, d1:'Intercites', d2:'', d3:'FR',  notes:'Train back to Lexos.' },
  { id:136, date:'2026-04-27', mode:'Bike',  origine:'Lexos',                   destination:'Saint-Antonin-Noble-Val', distance:18,  d1:'', d2:'',      d3:'',        notes:'Biked home from the station.' },

  // ── May: London trip ──────────────────────────────────────────────────
  { id:137, date:'2026-05-07', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Caussade',                distance:25,  d1:'1', d2:'Sedan', d3:'',        notes:'Dropped the car in Caussade before heading to London.' },
  { id:138, date:'2026-05-07', mode:'Train', origine:'Caussade',                destination:'Toulouse',                distance:70,  d1:'Intercites', d2:'', d3:'FR',  notes:'Train to Toulouse to catch the flight.' },
  { id:139, date:'2026-05-08', mode:'Plane', origine:'Toulouse TLS',            destination:'London LGW',              distance:1150,d1:'A320', d2:'',   d3:'Economy', notes:'Flight to London for a week — so excited to see friends again!' },
  { id:140, date:'2026-05-15', mode:'Bus',   origine:'London',                  destination:'Dover',                   distance:130, d1:'Coach', d2:'National Express', d3:'', notes:'National Express bus to Dover, straightforward ride.' },
  { id:141, date:'2026-05-15', mode:'Boat',  origine:'Dover',                   destination:'Calais',                  distance:56,  d1:'Foot passenger', d2:'P&O Ferries', d3:'', notes:'Dover-Calais ferry crossing, stunning view of the white cliffs from the deck.' },
  { id:142, date:'2026-05-15', mode:'Bus',   origine:'Calais',                  destination:'Paris',                   distance:295, d1:'Coach', d2:'FlixBus', d3:'',   notes:'FlixBus Calais to Paris — long ride but cheap.' },
  { id:143, date:'2026-05-15', mode:'Train', origine:'Paris',                   destination:'Caussade',                distance:580, d1:'Intercites de nuit', d2:'', d3:'FR', notes:'Night train from Paris to Caussade, slept like a baby.' },
  { id:144, date:'2026-05-16', mode:'Bike',  origine:'Caussade',                destination:'Saint-Antonin-Noble-Val', distance:25,  d1:'', d2:'',      d3:'',        notes:'Biked home from Caussade, so good to be back!' },

  // ── June: Italy trip + local outings ──────────────────────────────────
  { id:145, date:'2026-06-04', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Penne',                   distance:12,  d1:'', d2:'',      d3:'',        notes:'Bike ride to Penne, the gorges look amazing this time of year.' },
  { id:146, date:'2026-06-06', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Vaour',                   distance:8,   d1:'', d2:'',      d3:'',        notes:'Run to Vaour, good training session!' },

  // Italy outbound (Jun 8)
  { id:147, date:'2026-06-08', mode:'Car',   origine:'Saint-Antonin-Noble-Val', destination:'Toulouse',                distance:115, d1:'1', d2:'Sedan', d3:'',        notes:'Drove to Toulouse to catch the overnight bus to Turin.' },
  { id:148, date:'2026-06-08', mode:'Bus',   origine:'Toulouse',                destination:'Turin',                   distance:430, d1:'Coach', d2:'FlixBus', d3:'',   notes:'FlixBus overnight to Turin through the Alps — very long and not the most comfortable, but the wallet says thank you.' },

  // Turin to Naples
  { id:149, date:'2026-06-10', mode:'Train', origine:'Turin',                   destination:'Naples',                  distance:1010,d1:'Frecciarossa', d2:'', d3:'IT', notes:'Frecciarossa from Turin to Naples — Italian trains are something else: fast, smooth, and stunning scenery. A real revelation.' },

  // Italy return (Jun 13)
  { id:150, date:'2026-06-13', mode:'Train', origine:'Naples',                  destination:'Turin',                   distance:1010,d1:'Frecciarossa', d2:'', d3:'IT', notes:'Frecciarossa back to Turin, just as pleasant as the outbound. You get used to this level of comfort very quickly!' },
  { id:151, date:'2026-06-13', mode:'Bus',   origine:'Turin',                   destination:'Toulouse',                distance:430, d1:'Coach', d2:'FlixBus', d3:'',   notes:'Overnight bus Turin to Toulouse — even longer than the way there. Next time I am taking the train all the way.' },
  { id:152, date:'2026-06-14', mode:'Car',   origine:'Toulouse',                destination:'Saint-Antonin-Noble-Val', distance:115, d1:'1', d2:'Sedan', d3:'',        notes:'Drove back from Toulouse, happy to see my hills again.' },

  { id:153, date:'2026-06-18', mode:'Bike',  origine:'Saint-Antonin-Noble-Val', destination:'Najac',                   distance:22,  d1:'', d2:'',      d3:'',        notes:'Bike to Najac, picnic lunch by the Aveyron river.' },
  { id:154, date:'2026-06-25', mode:'Walk',  origine:'Saint-Antonin-Noble-Val', destination:'Cazals',                  distance:5,   d1:'', d2:'',      d3:'',        notes:'End-of-week walk to Cazals to wind down.' },
];
