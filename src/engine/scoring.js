/**
 * Scoring on top of the county sim: environments, the draft score, grades,
 * and head-to-head. See docs/SCORING.md.
 */
import { simulate, rateRoster, prepare, K } from './sim.js';
export { laneFit, effectiveRating, rateRoster, prepare, simulate, K, CAT_SHARE, COUNTIES, COUNTY_BY_FIPS } from './sim.js';

/* ── national environment ─────────────────────────────────────────────────
 * The national popular-vote margin, D-positive. A tied vote is not a tied
 * Electoral College on this map, so the labels are calibrated to what a
 * head-to-head matchup actually does — see docs/SCORING.md — not to zero.
 * Values are set by tools/balance.mjs.
 */
export const ENVIRONMENTS = [
  { id: 'r-wave', label: 'Republican wave', value: -2.0 },
  { id: 'lean-r', label: 'Lean Republican', value:  2.5 },
  { id: 'tossup', label: 'Toss-up',         value:  3.5 },
  { id: 'lean-d', label: 'Lean Democratic', value:  4.5 },
  { id: 'd-wave', label: 'Democratic wave', value:  6.5 }
];
for (const e of ENVIRONMENTS) e.sub = (e.value < 0 ? 'R+' : 'D+') + Math.abs(e.value).toFixed(1) + ' popular vote';
export const DEFAULT_ENV = 'tossup';
export const envValue = id => (ENVIRONMENTS.find(e => e.id === id) || ENVIRONMENTS[2]).value;

/* ── draft score ──────────────────────────────────────────────────────────*/
const norm = (v, lo, hi) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

export function scoreDraft(team, { env = envValue(DEFAULT_ENV), opponent } = {}) {
  const T = prepare(team);
  const sim = simulate(T, { env, opponent });
  const ceiling = simulate(T, { env, opponent, shift: T.lane.volatility });
  const floor = simulate(T, { env, opponent, shift: -T.lane.volatility });
  const filled = Math.max(1, T.rating.filledCount);
  const parts = {
    map:  norm(sim.ev, 170, 370),
    unit: norm(T.rating.overall, 62, 94),
    fit:  T.rating.onLane / filled,
    tip:  norm(sim.tipping ? sim.tipping.margin : -12, -8, 8)
  };
  const score = Math.round(1000 * (0.40 * parts.map + 0.25 * parts.unit + 0.15 * parts.fit + 0.20 * parts.tip));
  return { ...sim, score, parts, ceiling, floor, rating: T.rating };
}

export const headToHead = (a, b, env) =>
  a.lane.side === b.lane.side ? null : simulate(a, { env, vs: b });

export const GRADES = [
  [900, 'S',  'Landslide architecture'], [820, 'A+', 'Wins going away'], [750, 'A', 'Wins the map'],
  [680, 'B+', 'Wins an ordinary night'], [610, 'B', 'Live on election night'], [540, 'C+', 'Needs the breaks'],
  [470, 'C', 'Underdog'], [400, 'D', 'Structurally behind'], [0, 'F', 'Concession speech drafted']
];
export const gradeFor = s => GRADES.find(g => s >= g[0]);
