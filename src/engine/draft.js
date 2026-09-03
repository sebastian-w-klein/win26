import { ROLES } from '../data/roles.js';
import { LANES, LANE_BY_ID } from '../data/lanes.js';
import { BY_ROLE, BY_ID } from '../data/operatives.js';
import { laneFit, envValue, DEFAULT_ENV, scoreDraft, rateRoster } from './scoring.js';
import { FORM_MULT } from '../data/operatives.js';

export const SOLO_CAP = 1200;

/* Small seeded PRNG so a league replays identically from its seed. */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export const WAR_ROOM_NAMES = [
  'Foghorn Analytics', 'The Basement Office', 'Blue Wall Partners', 'Third Rail Group',
  'Northstar War Room', 'Precinct 9', 'The Boiler Room', 'Sunbelt Strategies'
];

/* ── league setup ─────────────────────────────────────────────────────────*/

export function createLeague({ teams = 4, humanName = 'Your War Room', env = DEFAULT_ENV, seed = Date.now() } = {}) {
  const rand = rng(seed);
  const order = [...Array(teams).keys()];
  return {
    mode: 'snake',
    seed, rand, env,
    envPoints: envValue(env),
    teams: order.map(i => ({
      idx: i,
      name: i === 0 ? humanName : WAR_ROOM_NAMES[(i - 1) % WAR_ROOM_NAMES.length],
      human: i === 0,
      lane: null,
      roster: Object.fromEntries(ROLES.map(r => [r.id, null])),
      log: []
    })),
    round: 0,            // 0 = lane selection, 1..21 = role rounds
    pickInRound: 0,
    done: false
  };
}

export function createSolo({ env = DEFAULT_ENV, humanName = 'Your War Room' } = {}) {
  return {
    mode: 'solo',
    env,
    envPoints: envValue(env),
    cap: SOLO_CAP,
    teams: [{
      idx: 0, name: humanName, human: true, lane: null,
      roster: Object.fromEntries(ROLES.map(r => [r.id, null])), log: []
    }],
    round: 0, pickInRound: 0, done: false
  };
}

/* ── turn order ───────────────────────────────────────────────────────────*/

/** Snake: odd rounds run forward, even rounds run back. */
export function orderForRound(league, round) {
  const n = league.teams.length;
  const fwd = [...Array(n).keys()];
  return round % 2 === 1 ? fwd : fwd.reverse();
}

export function onClock(league) {
  if (league.done) return null;
  const order = league.round === 0 ? [...Array(league.teams.length).keys()] : orderForRound(league, league.round);
  return league.teams[order[league.pickInRound]] ?? null;
}

export function currentRole(league) {
  return league.round === 0 ? null : ROLES[league.round - 1];
}

/** Picks remaining before this team is on the clock again. */
export function picksUntilNextTurn(league, teamIdx) {
  let r = league.round, p = league.pickInRound, n = league.teams.length, count = 0;
  for (let guard = 0; guard < 500; guard++) {
    const order = r === 0 ? [...Array(n).keys()] : orderForRound(league, r);
    if (order[p] === teamIdx && count > 0) return count;
    count++;
    p++;
    if (p >= n) { p = 0; r++; }
    if (r > ROLES.length) return Infinity;
  }
  return Infinity;
}

/* ── availability ─────────────────────────────────────────────────────────*/

export function takenIds(league) {
  const set = new Set();
  for (const t of league.teams) for (const p of Object.values(t.roster)) if (p) set.add(p.id);
  return set;
}

export function availableFor(league, roleId) {
  if (league.mode === 'solo') return BY_ROLE[roleId];
  const taken = takenIds(league);
  return BY_ROLE[roleId].filter(p => !taken.has(p.id));
}

export function availableLanes(league) {
  const taken = new Set(league.teams.map(t => t.lane?.id).filter(Boolean));
  return LANES.filter(l => !taken.has(l.id));
}

/* ── making picks ─────────────────────────────────────────────────────────*/

function advance(league) {
  league.pickInRound++;
  if (league.pickInRound >= league.teams.length) {
    league.pickInRound = 0;
    league.round++;
    if (league.round > ROLES.length) { league.done = true; league.round = ROLES.length; }
  }
}

export function pickLane(league, team, laneId) {
  team.lane = LANE_BY_ID[laneId];
  team.log.push({ round: 0, label: 'Lane', value: team.lane.name });
  advance(league);
  return team.lane;
}

export function pickOperative(league, team, operativeId) {
  const op = BY_ID[operativeId];
  if (!op) throw new Error(`unknown operative: ${operativeId}`);
  const role = ROLES.find(r => r.id === op.role);
  team.roster[role.id] = op;
  team.log.push({ round: role.n, label: role.title, value: op.name, fit: laneFit(op, team.lane).label });
  advance(league);
  return op;
}

/* ── the bots ─────────────────────────────────────────────────────────────*/

/**
 * How much a bot wants a given operative. Bots weigh raw ability, fit with the
 * lane they took, current form, and how much the slot matters — then add a
 * little noise so two bots in the same lane do not draft identically.
 */
export function botValue(op, lane, role, rand) {
  const fit = laneFit(op, lane);
  const base = op.ovr * fit.mult * FORM_MULT[op.form ?? 'N'];
  const noise = (rand() - 0.5) * 6;
  return base * (0.85 + 0.15 * role.weight) + noise;
}

export function botPickLane(league, team) {
  const open = availableLanes(league);
  const rand = league.rand || Math.random;
  // Bots favor lanes with a deep available bench, which naturally spreads them out.
  const scored = open.map(lane => {
    let depth = 0;
    for (const role of ROLES) {
      const pool = availableFor(league, role.id);
      const top = pool.map(p => p.ovr * laneFit(p, lane).mult).sort((a, b) => b - a)[0] ?? 60;
      depth += top * role.weight;
    }
    return { lane, v: depth + (rand() - 0.5) * 30 };
  });
  scored.sort((a, b) => b.v - a.v);
  return pickLane(league, team, scored[0].lane.id);
}

export function botPick(league, team) {
  if (league.round === 0) return botPickLane(league, team);
  const role = currentRole(league);
  const pool = availableFor(league, role.id);
  const rand = league.rand || Math.random;
  const best = pool
    .map(op => ({ op, v: botValue(op, team.lane, role, rand) }))
    .sort((a, b) => b.v - a.v)[0];
  return pickOperative(league, team, best.op.id);
}

/**
 * Run bot picks until a human is on the clock or the draft ends.
 * The round is captured BEFORE the pick, because making it advances the round.
 */
export function runBots(league, onPick) {
  let guard = 0;
  while (!league.done && guard++ < 500) {
    const team = onClock(league);
    if (!team || team.human) break;
    const round = league.round;
    const result = round === 0 ? botPickLane(league, team) : botPick(league, team);
    onPick?.(team, result, round);
  }
}

/* ── standings ────────────────────────────────────────────────────────────*/

/**
 * In a league you are not running against a generic campaign, you are running
 * against the war rooms that drafted out of the same pool. The opposing
 * operation is set to the field's own average, so a strong league is a harder
 * election night for everyone in it.
 */
export function leagueOpponent(league) {
  const rated = league.teams.filter(t => t.lane).map(t => rateRoster(t.roster, t.lane).overall);
  if (rated.length < 2) return undefined;
  return rated.reduce((a, b) => a + b, 0) / rated.length;
}

export function standings(league) {
  const opponent = league.mode === 'snake' ? leagueOpponent(league) : undefined;
  return league.teams
    .filter(t => t.lane)
    .map(t => ({ team: t, result: scoreDraft(t.roster, t.lane, league.envPoints, opponent) }))
    .sort((a, b) => b.result.score - a.result.score);
}

/* ── share codes ──────────────────────────────────────────────────────────
 * lane index + one base36 digit per role slot + environment. Short enough to
 * paste into a group chat.
 */
const B36 = '0123456789abcdefghijklmnopqrstuvwxyz';

export function encodeRoster(lane, roster, env) {
  let out = B36[LANES.findIndex(l => l.id === lane.id)];
  for (const role of ROLES) {
    const pick = roster[role.id];
    out += pick ? B36[BY_ROLE[role.id].findIndex(p => p.id === pick.id) + 1] : '0';
  }
  const envIdx = ['r-wave', 'lean-r', 'tossup', 'lean-d', 'd-wave'].indexOf(env);
  return out + B36[envIdx < 0 ? 2 : envIdx];
}

export function decodeRoster(code) {
  const clean = String(code).trim().toLowerCase();
  if (clean.length !== ROLES.length + 2) return null;
  const lane = LANES[B36.indexOf(clean[0])];
  if (!lane) return null;
  const roster = {};
  for (let i = 0; i < ROLES.length; i++) {
    const idx = B36.indexOf(clean[i + 1]) - 1;
    const pool = BY_ROLE[ROLES[i].id];
    roster[ROLES[i].id] = idx >= 0 && idx < pool.length ? pool[idx] : null;
  }
  const env = ['r-wave', 'lean-r', 'tossup', 'lean-d', 'd-wave'][B36.indexOf(clean.at(-1))] || DEFAULT_ENV;
  return { lane, roster, env };
}

/* ── lane difficulty, computed from actual bench depth ────────────────────*/
export const LANE_DEPTH = LANES.map(lane => {
  let sum = 0, max = 0;
  for (const role of ROLES) {
    const pool = BY_ROLE[role.id];
    sum += Math.max(...pool.map(p => p.ovr * laneFit(p, lane).mult)) * role.weight;
    max += Math.max(...pool.map(p => p.ovr)) * 1.1 * role.weight;
  }
  return { lane, depth: sum / max };
});
export const DEPTH_BY_LANE = Object.fromEntries(LANE_DEPTH.map(d => [d.lane.id, d.depth]));
