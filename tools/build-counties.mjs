/**
 * Builds src/data/counties.js and src/data/states.js from the raw sources in
 * data/raw/. Run with `npm run build:data`.
 *
 * Output convention: every margin is D-positive, in points of the two-party
 * vote. `lean` is PVI-style — the county's margin minus the national margin,
 * averaged equally across 2020 and 2024, the way Cook computes it.
 *
 * Four cycles are read, not two. 2020 and 2024 come from the county results
 * files; 2016 and 2012 come from the MEDSL context file, which carries both
 * presidential votes. The extra two cycles stay out of `lean` — Cook's
 * definition is the last two — but they are what makes `elasticity` and
 * `drift` measurable.
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
// membership rate 2024 (% of employed, approximate — see data/raw/SOURCES.md).
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

/* ── results, 2020 and 2024 ─────────────────────────────────────────────── */
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

/* ── context file: 2016 + 2012 results, and the demographics ────────────── */
// MEDSL's election-context file carries the presidential vote back to 2012
// alongside the census variables. It has no Alaska rows at all, so both the
// older cycles and the demographics fall back there (see the fallback pass).
const medsl = csv(raw('election-context-2018.csv'));
const DEMO = {}, OLD = {};
let n16d = 0, n16r = 0, n16o = 0, n12d = 0, n12r = 0;
for (const r of medsl) {
  const fips = String(r.fips).padStart(5, '0');
  const num = k => { const v = parseFloat(r[k]); return Number.isFinite(v) ? v : null; };
  DEMO[fips] = {
    college: num('lesscollege_pct') == null ? null : 100 - num('lesscollege_pct'),
    latino: num('hispanic_pct'), black: num('black_pct'), rural: num('rural_pct'),
    young: num('age29andunder_pct'), senior: num('age65andolder_pct'),
    // Non-college white share of adults: the axis the college number alone
    // cannot express, and the one the 2012-2024 realignment ran along.
    ncwhite: num('lesscollege_whites_pct'),
    income: num('median_hh_inc'), foreign: num('foreignborn_pct'),
    unemp: num('clf_unemploy_pct'), rucc: num('ruralurban_cc'),
    pop: num('total_population'), cvap: num('cvap')
  };
  const d16 = num('clinton16'), g16 = num('trump16'), o16 = num('otherpres16');
  const d12 = num('obama12'), g12 = num('romney12');
  OLD[fips] = {
    m16: d16 != null && g16 != null && d16 + g16 > 0 ? margin(d16, g16) : null,
    m12: d12 != null && g12 != null && d12 + g12 > 0 ? margin(d12, g12) : null,
    // Third-party share of ALL votes cast, 2016. The Johnson/Stein cycle is the
    // cleanest read available on where a protest vote is actually on offer.
    third16: d16 != null && g16 != null && o16 != null && d16 + g16 + o16 > 0
      ? o16 / (d16 + g16 + o16) * 100 : null
  };
  n16d += d16 || 0; n16r += g16 || 0; n16o += o16 || 0; n12d += d12 || 0; n12r += g12 || 0;
}
const NAT16 = margin(n16d, n16r), NAT12 = margin(n12d, n12r);
console.log(`                           2016 D+${NAT16.toFixed(2)}  2012 D+${NAT12.toFixed(2)}  (context file, no Alaska)`);

const AXES = ['college', 'latino', 'black', 'rural', 'young', 'senior', 'ncwhite', 'income'];
const EXTRA = ['foreign', 'unemp', 'rucc'];

/* ── geometry ───────────────────────────────────────────────────────────── */
const topo = JSON.parse(raw('counties-albers-10m.json'));
const geoms = topo.objects.counties.geometries;

/* ── assemble counties ──────────────────────────────────────────────────── */
let bridged = { ak: 0, ct: 0, dc: 0, other: 0 }, demoFallback = 0, oldFallback = 0;
const counties = [];
for (const g of geoms) {
  const fips = g.id, st = STATE_BY_FIPS[fips.slice(0, 2)];
  if (!st) continue; // territories are not in us-atlas, but guard anyway
  const name = g.properties.name;

  let m24, m20, votes, votes20;
  // Alaska reports by state house district in both files, and district ids
  // 02001-02040 collide with real borough FIPS codes. Never match them.
  const isAK = st.abbr === 'AK';
  const a = isAK ? null : T24.by[fips], b = isAK ? null : T20.by[fips];
  const s24 = S24[st.fips], s20 = S20[st.fips];
  const stateSwing = margin(s24.d, s24.g) - margin(s20.d, s20.g);

  if (a && b) { m24 = margin(a.d, a.g); m20 = margin(b.d, b.g); votes = a.t; votes20 = b.t; }
  else if (b) { m20 = margin(b.d, b.g); m24 = m20 + stateSwing; votes = Math.round(b.t * (s24.t / s20.t)); votes20 = b.t; bridged[st.abbr === 'AK' ? 'ak' : st.abbr === 'CT' ? 'ct' : 'other']++; }
  else if (a) { m24 = margin(a.d, a.g); m20 = m24 - stateSwing; votes = a.t; votes20 = Math.round(a.t * (s20.t / s24.t)); bridged.other++; }
  else { m24 = margin(s24.d, s24.g); m20 = margin(s20.d, s20.g); votes = 0; votes20 = 0; bridged[isAK ? 'ak' : 'other']++; }
  if (fips === '11001' && !a) { m24 = margin(s24.d, s24.g); m20 = b ? margin(b.d, b.g) : m24 - stateSwing; votes = s24.t; votes20 = s20.t; bridged.dc++; bridged.other--; }

  const lean = 0.5 * (m24 - T24.national) + 0.5 * (m20 - T20.national);

  // Third-party share of all votes cast in 2024, straight off the results file.
  const third24 = a && a.t > 0 ? Math.max(0, (a.t - a.d - a.g) / a.t * 100) : null;

  let d = DEMO[fips];
  if (!d || AXES.some(k => d[k] == null)) demoFallback++;
  const old = OLD[fips] || {};
  if (old.m16 == null || old.m12 == null) oldFallback++;

  counties.push({
    fips, name, st: st.abbr, lean, m24, m20, m16: old.m16 ?? null, m12: old.m12 ?? null,
    votes, votes20, third16: old.third16 ?? null, third24, demo: d || {}
  });
}

// Alaska boroughs carry statewide margins; split the statewide vote among them
// by population so state aggregation still weights them.
{
  const ak = counties.filter(c => c.st === 'AK');
  const pop = ak.reduce((s, c) => s + (c.demo.pop || 0), 0);
  for (const c of ak) {
    const share = pop ? (c.demo.pop || 0) / pop : 1 / ak.length;
    c.votes = Math.round(S24['02'].t * share);
    c.votes20 = Math.round(S20['02'].t * share);
  }
}

/* ── fallbacks: state vote-weighted mean, then national ─────────────────── */
const meanOf = (list, k, get = c => c.demo[k]) => {
  let n = 0, w = 0;
  for (const c of list) { const v = get(c); if (v != null && c.votes > 0) { n += v * c.votes; w += c.votes; } }
  return w ? n / w : null;
};
const byState = {};
for (const c of counties) (byState[c.st] ||= []).push(c);

for (const k of [...AXES, ...EXTRA]) {
  const nat = meanOf(counties, k);
  for (const c of counties) if (c.demo[k] == null) c.demo[k] = meanOf(byState[c.st], k) ?? nat;
}
for (const k of ['m16', 'm12', 'third16', 'third24']) {
  const get = c => c[k];
  const nat = meanOf(counties, k, get);
  for (const c of counties) if (c[k] == null) c[k] = meanOf(byState[c.st], k, get) ?? nat;
}

/* ── elasticity and drift, from four cycles ─────────────────────────────────
 * A county's lean in a cycle is its margin minus the national margin that
 * year. `churn` is how far that lean moves from cycle to cycle: a county that
 * sat at R+20 through all four is inelastic and no campaign is going to move
 * it, while one that went from D+5 to R+12 has voters who actually change
 * their minds. Normalizing churn to a vote-weighted national mean of 1.0 makes
 * `elasticity` a multiplier the sim can apply to everything a campaign
 * controls without moving the national number.
 *
 * `drift` is the twelve-year direction: lean in 2024 minus lean in 2012.
 */
for (const c of counties) {
  const l = [c.m12 - NAT12, c.m16 - NAT16, c.m20 - T20.national, c.m24 - T24.national];
  c.churn = (Math.abs(l[1] - l[0]) + Math.abs(l[2] - l[1]) + Math.abs(l[3] - l[2])) / 3;
  c.drift = l[3] - l[0];
  c.growth = c.votes20 > 0 ? (c.votes / c.votes20 - 1) * 100 : 0;
  c.third = 0.5 * c.third16 + 0.5 * c.third24;
}
{
  const mean = meanOf(counties, 'churn', c => c.churn);
  for (const c of counties) c.elasticity = Math.max(0.35, Math.min(2.5, c.churn / mean));
  console.log(`churn: national vote-weighted mean ${mean.toFixed(2)} points per cycle`);
}

/* ── axis statistics ────────────────────────────────────────────────────── */
// Vote-weighted national mean and SD per axis so the engine can z-score.
const stats = {};
const statOf = (k, get) => {
  let w = 0, s = 0, s2 = 0;
  for (const c of counties) { const v = get(c); w += c.votes; s += v * c.votes; s2 += v * v * c.votes; }
  const mean = s / w, sd = Math.sqrt(Math.max(0, s2 / w - mean * mean));
  stats[k] = { mean: +mean.toFixed(3), sd: +sd.toFixed(3) };
};
for (const k of AXES) statOf(k, c => c.demo[k]);
statOf('protest', c => c.third);
statOf('union', c => STATE_BY_FIPS[c.fips.slice(0, 2)].union);   // the one state-level axis

/* ── states from counties ───────────────────────────────────────────────── */
const wmean = (cs, get) => {
  const w = cs.reduce((s, c) => s + c.votes, 0);
  return cs.reduce((s, c) => s + get(c) * c.votes, 0) / w;
};
const states = STATE_ROWS.map(([fips, abbr, name, ev, union]) => {
  const cs = byState[abbr];
  const w = cs.reduce((s, c) => s + c.votes, 0);
  return {
    fips, abbr, name, ev, union,
    lean: +wmean(cs, c => c.lean).toFixed(2),
    m24: +wmean(cs, c => c.m24).toFixed(2),
    elasticity: +wmean(cs, c => c.elasticity).toFixed(2),
    drift: +wmean(cs, c => c.drift).toFixed(1),
    third: +wmean(cs, c => c.third).toFixed(2),
    growth: +wmean(cs, c => c.growth).toFixed(1),
    income: Math.round(wmean(cs, c => c.demo.income)),
    ncwhite: +wmean(cs, c => c.demo.ncwhite).toFixed(1),
    votes: w, counties: cs.length
  };
});

/* ── emit ───────────────────────────────────────────────────────────────── */
const r1 = n => Math.round(n * 10) / 10, r2 = n => Math.round(n * 100) / 100;
const rows = counties.map(c => [
  c.fips, c.name, c.st, r2(c.lean), c.votes,
  r1(c.demo.college), r1(c.demo.latino), r1(c.demo.black), r1(c.demo.rural), r1(c.demo.young), r1(c.demo.senior),
  r1(c.demo.ncwhite), Math.round(c.demo.income), r2(c.third), r2(c.elasticity), r1(c.drift), r1(c.growth),
  Math.round(c.demo.rucc)
]);

const header = `// GENERATED by tools/build-counties.mjs — do not edit. See data/raw/SOURCES.md.
// Margins are D-positive, in points of the two-party vote.\n`;

writeFileSync(resolve(root, 'src/data/counties.js'), header + `
/**
 * One row per county:
 *  0 fips  1 name  2 state  3 lean (PVI-style, 2020+2024)  4 votes cast 2024
 *  5 college%  6 latino%  7 black%  8 rural%  9 under30%  10 over65%
 * 11 non-college white % of adults   12 median household income ($)
 * 13 third-party % of votes cast (2016 and 2024 averaged)
 * 14 elasticity (1.00 = the national average county, four cycles of lean churn)
 * 15 drift: lean in 2024 minus lean in 2012, D-positive
 * 16 turnout growth 2020→2024, %      17 USDA rural-urban continuum code (1-9)
 */
export const COUNTY_ROWS = ${JSON.stringify(rows)};

/** Vote-weighted national mean and standard deviation of each axis. */
export const AXIS_STATS = ${JSON.stringify(stats)};

export const NATIONAL_MARGIN = { y2024: ${r2(T24.national)}, y2020: ${r2(T20.national)}, y2016: ${r2(NAT16)}, y2012: ${r2(NAT12)} };

/** us-atlas counties-albers-10m: Albers USA, pre-projected to a 975×610 frame. */
export const TOPO = ${JSON.stringify(topo)};
`);

writeFileSync(resolve(root, 'src/data/states.js'), header + `
/** All 50 states + DC. Every field but ev and union is aggregated up from the
 *  counties, vote-weighted by 2024 turnout. */
export const STATE_ROWS = ${JSON.stringify(states)};
export const STATES = STATE_ROWS;
export const STATE_BY_ABBR = Object.fromEntries(STATE_ROWS.map(s => [s.abbr, s]));
export const STATE_BY_FIPS = Object.fromEntries(STATE_ROWS.map(s => [s.fips, s]));
export const EV_TOTAL = 538;
export const EV_TO_WIN = 270;
`);

console.log(`counties: ${counties.length}  bridged from 2020: AK ${bridged.ak}, CT ${bridged.ct}, DC ${bridged.dc}, other ${bridged.other}`);
console.log(`fallbacks: demographics ${demoFallback}, 2012/2016 results ${oldFallback}`);
console.log('axis stats:', Object.entries(stats).map(([k, v]) => `${k} ${v.mean}±${v.sd}`).join('  '));
const bg = ['PA','MI','WI','AZ','GA','NC','NV','MN','NH','VA','NM'];
console.log('state leans (D+):', states.filter(s => bg.includes(s.abbr)).map(s => `${s.abbr} ${s.lean > 0 ? '+' : ''}${s.lean}`).join('  '));
console.log('state elasticity:', states.filter(s => bg.includes(s.abbr)).map(s => `${s.abbr} ${s.elasticity}`).join('  '));
const tied = states.filter(s => s.lean > 0).reduce((a, s) => a + s.ev, 0);
console.log(`at a tied national vote, D wins ${tied} EV`);

// The most and least movable places on the map, as a sanity check on churn.
const big = counties.filter(c => c.votes > 50000).sort((a, b) => b.elasticity - a.elasticity);
console.log('most elastic  :', big.slice(0, 6).map(c => `${c.name}, ${c.st} ${c.elasticity.toFixed(2)}`).join('  '));
console.log('least elastic :', big.slice(-6).map(c => `${c.name}, ${c.st} ${c.elasticity.toFixed(2)}`).join('  '));
const drifted = counties.filter(c => c.votes > 50000).sort((a, b) => a.drift - b.drift);
console.log('drifted right :', drifted.slice(0, 5).map(c => `${c.name}, ${c.st} ${c.drift.toFixed(0)}`).join('  '));
console.log('drifted left  :', drifted.slice(-5).map(c => `${c.name}, ${c.st} +${c.drift.toFixed(0)}`).join('  '));
