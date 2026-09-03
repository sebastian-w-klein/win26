/**
 * Builds src/data/pollster-ratings.js from the Silver Bulletin ratings CSV.
 *
 * Only the firms the draft pool actually references are emitted, to keep the
 * bundle small; the full 540-firm table stays in data/raw/.
 *
 * Silver Bulletin rates RELEASED PUBLIC POLLS in the last three weeks of a
 * race. Campaign pollsters do most of their work privately and never enter
 * that database, so poll counts here run from 446 (Mason-Dixon, which polls
 * publicly for news outlets) down to 1 (brilliant corners, which does not).
 * A rating built on one poll is noise, so each firm's SB-derived rating is
 * mean-reverted toward its editorial rating by poll count — the same move
 * Silver Bulletin makes on its own thin samples.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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

const rows = csv(readFileSync(resolve(root, 'data/raw/silver-bulletin-pollster-ratings-2026-01.csv'), 'utf8'));
const byName = Object.fromEntries(rows.map(r => [r.pollster, r]));

// Which Silver Bulletin firm backs each card in the pool, and what the card
// is rated at editorially. The editorial number is the reversion target for
// firms with thin public-poll samples; it carries reputation and pedigree that
// a public-poll accuracy score does not see.
export const FIRM_MAP = {
  'Fabrizio, Lee & Associates': 90,
  'Impact Research': 85,
  'Garin-Hart-Yang Research Group': 84,
  'Lake Research Partners': 82,
  'brilliant corners Research & Strategies': 82,
  'Echelon Insights': 81,
  'Public Opinion Strategies': 80,
  'Global Strategy Group': 80,
  'David Binder Research': 79,
  'Greenberg Quinlan Rosner': 88,
  'WPA Intelligence': 78,
  'Tulchin Research': 77,
  'North Star Opinion Research': 77,
  'McLaughlin & Associates': 76,
  'National Research': 74,
  'GBAO': 79,
  'Benenson Strategy Group': 78,
  'Cygnal': 79,
  'Data for Progress': 74,
  'Change Research': 72,
  'Tarrance Group': 77,
  'Meeting Street Insights': 74,
  'Clarity Campaign Labs': 73,
  'Normington, Petts & Associates': 72,
  'Ragnar Research Partners': 71,
  'Blueprint Polling': 73,
  'American Viewpoint': 74,
  'Basswood Research': 72,
  'Victory Insights': 70,
  'co/efficient': 72,
  'Susquehanna Polling & Research Inc.': 78,
  'Remington Research Group': 73,
  // Rated firms the pool did not previously reach. Adding them takes the
  // Chief Pollster slot from 26 cards to 38 and, more to the point, pulls in
  // the deeply-rated firms — Mason-Dixon has 446 rated polls, InsiderAdvantage
  // 208, Trafalgar 143 — where the Silver Bulletin number carries almost all
  // the weight and the editorial guess almost none.
  'OnMessage Inc.': 82,
  'Moore Information Group': 74,
  'EMC Research': 73,
  'Grove Insight': 72,
  'FM3 Research': 75,
  'Wick': 72,
  'Trafalgar Group': 70,
  'InsiderAdvantage': 70,
  'RMG Research': 70,
  'Big Data Poll': 64,
  'Selzer': 84,
  'Mason-Dixon Polling & Strategy': 80
};

// Predictive Plus-Minus is Silver Bulletin's forward-looking accuracy estimate;
// negative is better. This line puts the best rated firm near 92 and the worst
// near 68 before mean reversion.
const PPM_BASE = 81, PPM_SLOPE = 9.8;
const REVERT_N = 15;   // polls at which SB and editorial carry equal weight

const out = {};
const table = [];
for (const [firm, editorial] of Object.entries(FIRM_MAP)) {
  const r = byName[firm];
  if (!r) { console.warn(`  !! no Silver Bulletin row for "${firm}"`); continue; }
  const polls = +r.polls, ppm = +r.ppm;
  const sb = Math.max(58, Math.min(95, PPM_BASE - PPM_SLOPE * ppm));
  const w = polls / (polls + REVERT_N);
  const ovr = Math.round(w * sb + (1 - w) * editorial);
  out[firm] = {
    grade: r.grade, polls, ppm: +ppm.toFixed(2),
    bias: r.bias === '' ? 0 : +(+r.bias).toFixed(2),      // + = leans Democratic
    called: r.called === '' ? null : Math.round(+r.called * 100),
    err: r.avgErr === '' ? null : +(+r.avgErr).toFixed(1),
    // Share of rated polls whose result landed outside the poll's own margin
    // of error — the cleanest published read on whether a firm's confidence
    // is earned.
    miss: r.outMOE === '' ? null : Math.round(+r.outMOE * 100),
    // Advanced Plus-Minus: measured past accuracy against the field, before
    // Silver Bulletin projects it forward into the predictive number.
    apm: r.advPM === '' ? null : +(+r.advPM).toFixed(2),
    aapor: r.aapor === 'yes', banned: r.banned === 'yes',
    ovr
  };
  table.push({ firm, polls, grade: r.grade, ppm: +ppm.toFixed(2), sb: Math.round(sb), editorial, w: +w.toFixed(2), ovr, bias: +(+r.bias || 0).toFixed(2) });
}

writeFileSync(resolve(root, 'src/data/pollster-ratings.js'),
`// GENERATED by tools/build-pollsters.mjs — do not edit.
// Silver Bulletin pollster ratings, January 2026 release. See data/raw/SOURCES.md.
//
// grade   Silver Bulletin letter grade (A+ … F; A/B and B/C are provisional,
//         given to firms with fewer than ten rated polls)
// polls   rated polls in the database — campaign pollsters mostly poll
//         privately, so these counts are small and the OVR is reverted
// ppm     Predictive Plus-Minus: projected future accuracy, negative is better
// bias    historical statistical bias, POSITIVE means the firm has overstated
//         Democratic performance
// called  share of races where the firm called the winner
// err     average error on the margin, in points
// miss    share of rated polls that landed outside their own margin of error
// apm     Advanced Plus-Minus: measured past accuracy, negative is better
// ovr     gameplay rating: the ppm-derived rating reverted toward the card's
//         editorial rating by poll count

export const POLLSTER_RATINGS = ${JSON.stringify(out, null, 2)};
`);

table.sort((a, b) => b.ovr - a.ovr);
const c = (v, n) => String(v).padStart(n);
console.log('firm'.padEnd(40), c('polls', 5), c('grade', 5), c('ppm', 6), c('sb', 4), c('edit', 5), c('wt', 5), c('OVR', 4), c('bias', 7));
for (const t of table)
  console.log(t.firm.slice(0, 40).padEnd(40), c(t.polls, 5), c(t.grade, 5), c(t.ppm, 6), c(t.sb, 4), c(t.editorial, 5), c(t.w, 5), c(t.ovr, 4), c((t.bias > 0 ? 'D+' : 'R+') + Math.abs(t.bias), 7));
console.log(`\n${table.length} firms written to src/data/pollster-ratings.js`);
