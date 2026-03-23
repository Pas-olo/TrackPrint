// countries.js — Country data and helpers

const COUNTRIES_DATA = {
  AD:{name:"Andorra"},AE:{name:"United Arab Emirates"},AF:{name:"Afghanistan"},
  AG:{name:"Antigua and Barbuda"},AI:{name:"Anguilla"},AL:{name:"Albania"},AM:{name:"Armenia"},
  AO:{name:"Angola"},AR:{name:"Argentina"},AT:{name:"Austria"},AU:{name:"Australia"},AW:{name:"Aruba"},
  AZ:{name:"Azerbaijan"},BA:{name:"Bosnia and Herzegovina"},BB:{name:"Barbados"},
  BL:{name:"Saint Barthélemy"},BM:{name:"Bermuda"},
  BD:{name:"Bangladesh"},BE:{name:"Belgium"},BF:{name:"Burkina Faso"},
  BG:{name:"Bulgaria"},BH:{name:"Bahrain"},BI:{name:"Burundi"},BJ:{name:"Benin"},
  BN:{name:"Brunei"},BO:{name:"Bolivia"},BR:{name:"Brazil"},BS:{name:"Bahamas"},
  BT:{name:"Bhutan"},BW:{name:"Botswana"},BY:{name:"Belarus"},BZ:{name:"Belize"},
  CA:{name:"Canada"},CD:{name:"DR Congo"},CF:{name:"Central African Republic"},
  CG:{name:"Republic of the Congo"},CH:{name:"Switzerland"},CI:{name:"Ivory Coast"},
  CL:{name:"Chile"},CM:{name:"Cameroon"},CN:{name:"China"},CO:{name:"Colombia"},
  CR:{name:"Costa Rica"},CU:{name:"Cuba"},CV:{name:"Cape Verde"},CW:{name:"Curaçao"},CY:{name:"Cyprus"},
  CZ:{name:"Czech Republic"},DE:{name:"Germany"},DJ:{name:"Djibouti"},
  DK:{name:"Denmark"},DM:{name:"Dominica"},DO:{name:"Dominican Republic"},DZ:{name:"Algeria"},
  EC:{name:"Ecuador"},EE:{name:"Estonia"},EG:{name:"Egypt"},EH:{name:"Western Sahara"},ER:{name:"Eritrea"},
  ES:{name:"Spain"},ET:{name:"Ethiopia"},FI:{name:"Finland"},FJ:{name:"Fiji"},
  FR:{name:"France"},GA:{name:"Gabon"},GB:{name:"United Kingdom"},GD:{name:"Grenada"},GE:{name:"Georgia"},
  GF:{name:"French Guiana"},GH:{name:"Ghana"},GL:{name:"Greenland"},GM:{name:"Gambia"},GN:{name:"Guinea"},GQ:{name:"Equatorial Guinea"},
  GR:{name:"Greece"},GT:{name:"Guatemala"},GU:{name:"Guam"},GW:{name:"Guinea-Bissau"},GY:{name:"Guyana"},
  HN:{name:"Honduras"},HR:{name:"Croatia"},HT:{name:"Haiti"},HU:{name:"Hungary"},
  ID:{name:"Indonesia"},IE:{name:"Ireland"},IL:{name:"Israel"},IN:{name:"India"},
  IQ:{name:"Iraq"},IR:{name:"Iran"},IS:{name:"Iceland"},IT:{name:"Italy"},
  JM:{name:"Jamaica"},JO:{name:"Jordan"},JP:{name:"Japan"},KE:{name:"Kenya"},
  KG:{name:"Kyrgyzstan"},KH:{name:"Cambodia"},KM:{name:"Comoros"},
  KP:{name:"North Korea"},KR:{name:"South Korea"},KW:{name:"Kuwait"},
  KZ:{name:"Kazakhstan"},LA:{name:"Laos"},LB:{name:"Lebanon"},LC:{name:"Saint Lucia"},LI:{name:"Liechtenstein"},
  LK:{name:"Sri Lanka"},LR:{name:"Liberia"},LS:{name:"Lesotho"},LT:{name:"Lithuania"},
  LU:{name:"Luxembourg"},LV:{name:"Latvia"},LY:{name:"Libya"},MA:{name:"Morocco"},
  MC:{name:"Monaco"},MD:{name:"Moldova"},ME:{name:"Montenegro"},MF:{name:"Saint Martin"},MG:{name:"Madagascar"},
  MH:{name:"Marshall Islands"},MK:{name:"North Macedonia"},ML:{name:"Mali"},MM:{name:"Myanmar"},MN:{name:"Mongolia"},
  MQ:{name:"Martinique"},MR:{name:"Mauritania"},MS:{name:"Montserrat"},MT:{name:"Malta"},MU:{name:"Mauritius"},MV:{name:"Maldives"},
  MW:{name:"Malawi"},MX:{name:"Mexico"},MY:{name:"Malaysia"},MZ:{name:"Mozambique"},
  NA:{name:"Namibia"},NE:{name:"Niger"},NG:{name:"Nigeria"},NI:{name:"Nicaragua"},
  NL:{name:"Netherlands"},NO:{name:"Norway"},NP:{name:"Nepal"},NR:{name:"Nauru"},NZ:{name:"New Zealand"},
  OM:{name:"Oman"},PA:{name:"Panama"},PE:{name:"Peru"},PG:{name:"Papua New Guinea"},
  PH:{name:"Philippines"},PK:{name:"Pakistan"},PL:{name:"Poland"},PS:{name:"Palestine"},PT:{name:"Portugal"},
  PW:{name:"Palau"},PY:{name:"Paraguay"},QA:{name:"Qatar"},RE:{name:"Réunion"},RO:{name:"Romania"},RS:{name:"Serbia"},
  RU:{name:"Russia"},RW:{name:"Rwanda"},SA:{name:"Saudi Arabia"},SC:{name:"Seychelles"},
  SD:{name:"Sudan"},SE:{name:"Sweden"},SG:{name:"Singapore"},SI:{name:"Slovenia"},
  SK:{name:"Slovakia"},SL:{name:"Sierra Leone"},SM:{name:"San Marino"},SN:{name:"Senegal"},SO:{name:"Somalia"},
  SR:{name:"Suriname"},SS:{name:"South Sudan"},SV:{name:"El Salvador"},SX:{name:"Sint Maarten"},SY:{name:"Syria"},
  SZ:{name:"Eswatini"},TD:{name:"Chad"},TG:{name:"Togo"},TH:{name:"Thailand"},
  TJ:{name:"Tajikistan"},TL:{name:"East Timor"},TM:{name:"Turkmenistan"},
  TN:{name:"Tunisia"},TO:{name:"Tonga"},TR:{name:"Turkey"},TT:{name:"Trinidad and Tobago"},TV:{name:"Tuvalu"},
  TW:{name:"Taiwan"},TZ:{name:"Tanzania"},UA:{name:"Ukraine"},UG:{name:"Uganda"},
  US:{name:"United States"},UY:{name:"Uruguay"},UZ:{name:"Uzbekistan"},
  VA:{name:"Vatican City"},VC:{name:"Saint Vincent and the Grenadines"},VE:{name:"Venezuela"},VG:{name:"British Virgin Islands"},VN:{name:"Vietnam"},VU:{name:"Vanuatu"},
  WS:{name:"Samoa"},XK:{name:"Kosovo"},YE:{name:"Yemen"},YT:{name:"Mayotte"},ZA:{name:"South Africa"},
  ZM:{name:"Zambia"},ZW:{name:"Zimbabwe"},
};

function getFlagEmoji(iso) {
  if (!iso || iso.length !== 2) return '🏳️';
  try { return String.fromCodePoint(...[...iso.toUpperCase()].map(c => c.charCodeAt(0) + 127397)); }
  catch(e) { return '🏳️'; }
}
function getCountryName(iso) { return COUNTRIES_DATA[iso]?.name || iso; }

const COUNTRIES_LIST = Object.keys(COUNTRIES_DATA)
  .map(iso => ({ iso, name: COUNTRIES_DATA[iso].name, label: `${COUNTRIES_DATA[iso].name} ${getFlagEmoji(iso)}` }))
  .sort((a, b) => a.name.localeCompare(b.name));
