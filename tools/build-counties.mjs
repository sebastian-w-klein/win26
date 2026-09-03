/**
 * Builds src/data/counties.js and src/data/states.js from the raw sources in
 * data/raw/. Run with `npm run build:data`.
 *
 * Output convention: every margin is D-positive, in points of the two-party
 * vote. `lean` is PVI-style — the county's margin minus the national margin,
 * averaged equally across 2020 and 2024, the way Cook computes it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = f => readFileSync(resolve(root, 'data/raw', f), 'utf8');

/* ── csv ───────────────────────────────────────────────────────────────── */
function csv(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = split(lines[0]);
  return lines.slice(1).map(l => Object.fromEntries(split(l).map((v, i) => [head[i], v])));
}
function split(line) {
  const out = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur); return out;
}

/* ── states ─────────────────────────────────────────────────────────────── */
// fips, abbr, name, electoral votes (2024-2032 apportionment), BLS union
// membership rate 2024 (% of employed, approximate).
const STATE_ROWS = [
  ['01','AL','Alabama',9,6.2],['02','AK','Alaska',3,17.0],['04','AZ','Arizona',11,5.4],
  ['05','AR','Arkansas',6,4.9],['06','CA','California',54,15.4],['08','CO','Colorado',10,7.7],
  ['09','CT','Connecticut',7,15.9],['10','DE','Delaware',3,8.7],['11','DC','District of Columbia',3,9.4],
  ['12','FL','Florida',30,5.9],['13','GA','Georgia',16,5.2],['15','HI','Hawaii',4,24.1],
  ['16','ID','Idaho',4,5.3],['17','IL','Illinois',19,13.4],['18','IN','Indiana',11,8.3],
  ['19','IA','Iowa',6,8.4],['20','KS','Kansas',6,7.0],['21','KY','Kentucky',8,9.1],
  ['22','LA','Louisiana',8,4.5],['23','ME','Maine',4,12.0],['24','MD','Maryland',10,11.6],
  ['25','MA','Massachusetts',11,13.9],['26','MI','Michigan',15,13.3],['27','MN','Minnesota',10,13.9],
  ['28','MS','Mississippi',6,5.1],['29','MO','Missouri',10,9.5],['30','MT','Montana',4,11.7],
  ['31','NE','Nebraska',5,7.1],['32','NV','Nevada',6,13.8],['33','NH','New Hampshire',4,9.6],
  ['34','NJ','New Jersey',14,16.2],['35','NM','New Mexico',5,8.5],['36','NY','New York',28,20.6],
  ['37','NC','North Carolina',16,2.4],['38','ND','North Dakota',3,5.8],['39','OH','Ohio',17,12.1],
  ['40','OK','Oklahoma',7,5.5],['41','OR','Oregon',8,16.5],['42','PA','Pennsylvania',19,12.6],
  ['44','RI','Rhode Island',4,16.8],['45','SC','South Carolina',9,2.8],['46','SD','South Dakota',3,4.6],
  ['47','TN','Tennessee',11,5.4],['48','TX','Texas',40,4.5],['49','UT','Utah',6,4.4],
  ['50','VT','Vermont',3,10.6],['51','VA','Virginia',13,5.1],['53','WA','Washington',12,16.7],
  ['54','WV','West Virginia',4,10.6],['55','WI','Wisconsin',10,7.5],['56','WY','Wyoming',3,6.5]
];
const STATE_BY_FIPS = Object.fromEntries(STATE_ROWS.map(r => [r[0], { fips: r[0], abbr: r[1], name: r[2], ev: r[3], union: r[4] }]));
const totalEV = STATE_ROWS.reduce((s, r) => s + r[3], 0);
if (totalEV !== 538) throw new Error(`EV table sums to ${totalEV}, not 538`);

/* ── results ────────────────────────────────────────────────────────────── */
const r24 = csv(raw('2024_US_County_Level_Presidential_Results.csv'));
const r20 = csv(raw('2020_US_County_Level_Presidential_Results.csv'));
const tally = rows => {
  const by = {}; let D = 0, R = 0;
  for (const r of rows) {
    const d = +r.votes_dem, g = +r.votes_gop, t = +r.total_votes;
    by[r.county_fips] = { d, g, t, state: r.state_name };
    D += d; R += g;
  }
  return { by, national: margin(D, R) };
};
const margin = (d, g) => (d - g) / (d + g) * 100;
const T24 = tally(r24), T20 = tally(r20);
console.log(`national two-party margin  2024 D${T24.national.toFixed(2)}  2020 D+${T20.national.toFixed(2)}`);

// Statewide totals by state fips prefix (2024 house districts and wards sum correctly).
const stateTotals = (by) => {
  const s = {};
  for (const [fips, v] of Object.entries(by)) {
    const k = fips.slice(0, 2);
    (s[k] ||= { d: 0, g: 0, t: 0 }); s[k].d += v.d; s[k].g += v.g; s[k].t += v.t;
  }
  return s;
};
const S24 = stateTotals(T24.by), S20 = stateTotals(T20.by);

/* ── demographics ───────────────────────────────────────────────────────── */
const medsl = csv(raw('election-context-2018.csv'));
const DEMO = {};
for (const r of medsl) {
  const fips = String(r.fips).padStart(5, '0');
  const num = k => { const v = parseFloat(r[k]); return Number.isFinite(v) ? v : null; };
  DEMO[fips] = {
    college: num('lesscollege_pct') == null ? null : 100 - num('lesscollege_pct'),
    latino: num('hispanic_pct'), black: num('black_pct'), rural: num('rural_pct'),
    young: num('age29andunder_pct'), senior: num('age65andolder_pct'), pop: num('total_population')
  };
}
const AXES = ['college', 'latino', 'black', 'rural', 'young', 'senior'];

/* ── geometry ───────────────────────────────────────────────────────────── */
const topo = JSON.parse(raw('counties-albers-10m.json'));
const geoms = topo.objects.counties.geometries;

/* ── assemble counties ──────────────────────────────────────────────────── */
let bridged = { ak: 0, ct: 0, dc: 0, other: 0 }, demoFallback = 0;
const counties = [];
for (const g of geoms) {
  const fips = g.id, st = STATE_BY_FIPS[fips.slice(0, 2)];
  if (!st) continue; // territories are not in us-atlas, but guard anyway
  const name = g.properties.name;

  let m24, m20, votes;
  // Alaska reports by state house district in both files, and district ids
  // 02001-02040 collide with real borough FIPS codes. Never match them.
  const isAK = st.abbr === 'AK';
  const a = isAK ? null : T24.by[fips], b = isAK ? null : T20.by[fips];
  const s24 = S24[st.fips], s20 = S20[st.fips];
  const stateSwing = margin(s24.d, s24.g) - margin(s20.d, s20.g);

  if (a && b) { m24 = margin(a.d, a.g); m20 = margin(b.d, b.g); votes = a.t; }
  else if (b) { m20 = margin(b.d, b.g); m24 = m20 + stateSwing; votes = Math.round(b.t * (s24.t / s20.t)); bridged[st.abbr === 'AK' ? 'ak' : st.abbr === 'CT' ? 'ct' : 'other']++; }
  else if (a) { m24 = margin(a.d, a.g); m20 = m24 - stateSwing; votes = a.t; bridged.other++; }
  else { m24 = margin(s24.d, s24.g); m20 = margin(s20.d, s20.g); votes = 0; bridged[isAK ? 'ak' : 'other']++; }
  if (fips === '11001' && !a) { m24 = margin(s24.d, s24.g); m20 = b ? margin(b.d, b.g) : m24 - stateSwing; votes = s24.t; bridged.dc++; bridged.other--; }

  const lean = 0.5 * (m24 - T24.national) + 0.5 * (m20 - T20.national);

  let d = DEMO[fips];
  if (!d || AXES.some(k => d[k] == null)) demoFallback++;
  counties.push({ fips, name, st: st.abbr, lean, m24, votes, demo: d || {} });
}

// Alaska boroughs carry statewide margins; split the statewide vote among them
// by population so state aggregation still weights them.
{
  const ak = counties.filter(c => c.st === 'AK');
  const pop = ak.reduce((s, c) => s + (c.demo.pop || 0), 0);
  for (const c of ak) c.votes = Math.round(S24['02'].t * (pop ? (c.demo.pop || 0) / pop : 1 / ak.length));
}

// Demographic fallbacks: state vote-weighted mean, then national.
const meanOf = (list, k) => {
  let n = 0, w = 0;
  for (const c of list) if (c.demo[k] != null && c.votes > 0) { n += c.demo[k] * c.votes; w += c.votes; }
  return w ? n / w : null;
};
const natMean = Object.fromEntries(AXES.map(k => [k, meanOf(counties, k)]));
for (const c of counties) {
  const same = counties.filter(x => x.st === c.st);
  for (const k of AXES) if (c.demo[k] == null) c.demo[k] = meanOf(same, k) ?? natMean[k];
}

// Vote-weighted national mean and SD per axis so the engine can z-score.
const stats = {};
for (const k of AXES) {
  let w = 0, s = 0, s2 = 0;
  for (const c of counties) { w += c.votes; s += c.demo[k] * c.votes; s2 += c.demo[k] ** 2 * c.votes; }
  const mean = s / w, sd = Math.sqrt(Math.max(0, s2 / w - mean * mean));
  stats[k] = { mean: +mean.toFixed(3), sd: +sd.toFixed(3) };
}
{ // union is state-level; compute its weighted mean/sd the same way
  let w = 0, s = 0, s2 = 0;
  for (const c of counties) { const u = STATE_BY_FIPS[c.fips.slice(0, 2)].union; w += c.votes; s += u * c.votes; s2 += u * u * c.votes; }
  const mean = s / w; stats.union = { mean: +mean.toFixed(3), sd: +Math.sqrt(s2 / w - mean * mean).toFixed(3) };
}

/* ── states from counties ───────────────────────────────────────────────── */
const states = STATE_ROWS.map(([fips, abbr, name, ev, union]) => {
  const cs = counties.filter(c => c.st === abbr);
  const w = cs.reduce((s, c) => s + c.votes, 0);
  const lean = cs.reduce((s, c) => s + c.lean * c.votes, 0) / w;
  const m24 = cs.reduce((s, c) => s + c.m24 * c.votes, 0) / w;
  return { fips, abbr, name, ev, union, lean: +lean.toFixed(2), m24: +m24.toFixed(2), votes: w, counties: cs.length };
});

/* ── emit ───────────────────────────────────────────────────────────────── */
const r1 = n => Math.round(n * 10) / 10, r2 = n => Math.round(n * 100) / 100;
const rows = counties.map(c => [
  c.fips, c.name, c.st, r2(c.lean), c.votes,
  r1(c.demo.college), r1(c.demo.latino), r1(c.demo.black), r1(c.demo.rural), r1(c.demo.young), r1(c.demo.senior)
]);

const header = `// GENERATED by tools/build-counties.mjs — do not edit. See data/raw/SOURCES.md.
// Margins are D-positive, in points of the two-party vote.\n`;

writeFileSync(resolve(root, 'src/data/counties.js'), header + `
/** [fips, name, state, lean, votes2024, college%, latino%, black%, rural%, under30%, over65%] */
export const COUNTY_ROWS = ${JSON.stringify(rows)};

/** Vote-weighted national mean and standard deviation of each axis. */
export const AXIS_STATS = ${JSON.stringify(stats)};

export const NATIONAL_MARGIN = { y2024: ${r2(T24.national)}, y2020: ${r2(T20.national)} };

/** us-atlas counties-albers-10m: Albers USA, pre-projected to a 975×610 frame. */
export const TOPO = ${JSON.stringify(topo)};
`);

writeFileSync(resolve(root, 'src/data/states.js'), header + `
/** All 50 states + DC. lean is the vote-weighted mean of county leans. */
export const STATE_ROWS = ${JSON.stringify(states)};
export const STATES = STATE_ROWS;
export const STATE_BY_ABBR = Object.fromEntries(STATE_ROWS.map(s => [s.abbr, s]));
export const STATE_BY_FIPS = Object.fromEntries(STATE_ROWS.map(s => [s.fips, s]));
export const EV_TOTAL = 538;
export const EV_TO_WIN = 270;
`);

console.log(`counties: ${counties.length}  bridged from 2020: AK ${bridged.ak}, CT ${bridged.ct}, DC ${bridged.dc}, other ${bridged.other}  demographic fallbacks: ${demoFallback}`);
console.log('axis stats:', Object.entries(stats).map(([k, v]) => `${k} ${v.mean}±${v.sd}`).join('  '));
const bg = ['PA','MI','WI','AZ','GA','NC','NV','MN','NH','VA','NM'];
console.log('state leans (D+):', states.filter(s => bg.includes(s.abbr)).map(s => `${s.abbr} ${s.lean > 0 ? '+' : ''}${s.lean}`).join('  '));
const tied = states.filter(s => s.lean > 0).reduce((a, s) => a + s.ev, 0);
console.log(`at a tied national vote, D wins ${tied} EV`);
