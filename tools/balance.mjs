/**
 * Balance harness. Drafts many bot leagues and reports, per national
 * environment, how often each side wins head-to-head and how often a team
 * reaches 270 against the field. Run: node tools/balance.mjs [--sweep]
 */
import { createLeague, runBots, standings } from '../src/engine/draft.js';
import { headToHead, ENVIRONMENTS, prepare } from '../src/engine/scoring.js';

const sweep = process.argv.includes('--sweep');
const SEEDS = 24, TEAMS = 8;

function leagues() {
  const out = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const lg = createLeague({ teams: TEAMS, seed }); lg.teams[0].bot = true; runBots(lg);
    out.push(lg);
  }
  return out;
}
const LG = leagues();
const prepared = LG.map(lg => lg.teams.map(t => prepare(t)));

function h2hRate(env) {
  let dW = 0, n = 0, gaps = [];
  for (const teams of prepared) for (const a of teams) for (const b of teams) {
    if (a.lane.side !== 'D' || b.lane.side !== 'R') continue;
    const m = headToHead(a, b, env); n++; if (m.won) dW++; gaps.push(Math.abs(m.ev - m.evOpp));
  }
  gaps.sort((x, y) => x - y);
  return { pct: dW / n * 100, n, gap: gaps[gaps.length >> 1] };
}
function fieldRate(envId) {
  let dW = 0, dN = 0, rW = 0, rN = 0, scores = [];
  for (const lg of LG) {
    lg.env = envId; lg.envPoints = ENVIRONMENTS.find(e => e.id === envId).value;
    for (const s of standings(lg)) {
      scores.push(s.result.score);
      if (s.team.lane.side === 'D') { dN++; if (s.result.won) dW++; } else { rN++; if (s.result.won) rW++; }
    }
  }
  scores.sort((a, b) => a - b);
  return { d: dW / dN * 100, r: rW / rN * 100, p10: scores[Math.floor(scores.length * .1)], med: scores[scores.length >> 1], p90: scores[Math.floor(scores.length * .9)] };
}

console.log(`${LG.length} leagues × ${TEAMS} teams, bots only\n`);
console.log('env                 pop vote   h2h D-win  median gap | vs field: D-win  R-win  | score p10/med/p90');
for (const e of ENVIRONMENTS) {
  const h = h2hRate(e.value), f = fieldRate(e.id);
  console.log(`${e.label.padEnd(18)} ${e.sub.padEnd(20).slice(0, 10)}   ${h.pct.toFixed(0).padStart(4)}%     ${String(h.gap).padStart(4)}    |           ${f.d.toFixed(0).padStart(4)}%  ${f.r.toFixed(0).padStart(4)}%  |  ${f.p10} / ${f.med} / ${f.p90}`);
}
if (sweep) {
  console.log('\nfine sweep, head-to-head D win rate:');
  for (let v = -2; v <= 6; v += 0.5) console.log(`  ${v >= 0 ? 'D+' : 'R+'}${Math.abs(v).toFixed(1)}  ${h2hRate(v).pct.toFixed(0).padStart(4)}%`);
}
