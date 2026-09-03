/**
 * The draft. Round 1 is the lane; rounds 2-22 are free position: whoever is
 * on the clock takes any operative whose slot they still have open. Order
 * snakes. Works identically for a local practice league and for the shared
 * multiplayer league (net/league.js drives the same functions).
 */
import { ROLES, ROLE_BY_ID } from '../data/roles.js';
import { LANES, LANE_BY_ID } from '../data/lanes.js';
import { BY_ROLE, BY_ID, OPERATIVES, FORM_MULT, FIRM_GROUPS } from '../data/operatives.js';
import { laneFit, rateRoster, pollsterEdgeOf, TOTAL_WEIGHT, K } from './sim.js';
import { envValue, DEFAULT_ENV, scoreDraft } from './scoring.js';

export const MAX_TEAMS = 12;
export const ROUNDS = ROLES.length + 1;          // lane + 21 slots
export const SOLO_CAP = 1200;
export const DEFAULT_CLOCK = 90;                  // seconds; 0 = no clock

export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

export const WAR_ROOM_NAMES = [
  'Foghorn Analytics', 'The Basement Office', 'Blue Wall Partners', 'Third Rail Group',
  'Northstar War Room', 'Precinct 9', 'The Boiler Room', 'Sunbelt Strategies',
  'Tipping Point LLC', 'Late Deciders', 'Margin of Error', 'The Bunker'
];

export const emptyRoster = () => Object.fromEntries(ROLES.map(r => [r.id, null]));

export function makeTeam(idx, name, { human = false, bot = false } = {}) {
  return { idx, name, human, bot, lane: null, roster: emptyRoster(), picks: [] };
}

/* ── league setup (local) ─────────────────────────────────────────────────*/
export function createLeague({ teams = 4, humanName = 'Your War Room', env = DEFAULT_ENV, seed = Date.now(), clock = 0 } = {}) {
  const n = Math.max(2, Math.min(MAX_TEAMS, teams));
  return {
    mode: 'snake', seed, rand: rng(seed), env, envPoints: envValue(env), clock,
    teams: [...Array(n).keys()].map(i => makeTeam(i, i === 0 ? humanName : WAR_ROOM_NAMES[(i - 1) % WAR_ROOM_NAMES.length], { human: i === 0, bot: i !== 0 })),
    picks: [], round: 1, pickInRound: 0, done: false
  };
}

export function createSolo({ env = DEFAULT_ENV, humanName = 'Your War Room' } = {}) {
  return { mode: 'solo', env, envPoints: envValue(env), cap: SOLO_CAP, clock: 0,
           teams: [makeTeam(0, humanName, { human: true })], picks: [], round: 1, pickInRound: 0, done: false };
}

/* ── order ────────────────────────────────────────────────────────────────*/
export function orderForRound(league, round) {
  const fwd = [...Array(league.teams.length).keys()];
  return round % 2 === 1 ? fwd : fwd.reverse();
}
export const pickNumber = league => league.picks.length + 1;
export function onClock(league) {
  if (league.done) return null;
  return league.teams[orderForRound(league, league.round)[league.pickInRound]] ?? null;
}
export function picksUntil(league, teamIdx) {
  let r = league.round, p = league.pickInRound, n = league.teams.length, count = 0;
  for (let guard = 0; guard < 2000; guard++) {
    if (orderForRound(league, r)[p] === teamIdx && count > 0) return count;
    count++; p++;
    if (p >= n) { p = 0; r++; }
    if (r > ROUNDS) return Infinity;
  }
  return Infinity;
}
/** [{round, teamIdx}] for the whole draft, in pick order. */
export function fullOrder(league) {
  const out = [];
  for (let r = 1; r <= ROUNDS; r++) for (const t of orderForRound(league, r)) out.push({ round: r, teamIdx: t });
  return out;
}

/* ── availability ─────────────────────────────────────────────────────────*/
export function takenIds(league) {
  const set = new Set();
  for (const t of league.teams) for (const p of Object.values(t.roster)) if (p && !p.free) set.add(p.id);
  return set;
}

/** Firm id -> the team that has retained it. Drafting a partner takes the shop. */
export function retainedFirms(league) {
  const map = new Map();
  for (const t of league.teams)
    for (const p of Object.values(t.roster)) if (p?.group && !map.has(p.group)) map.set(p.group, t);
  return map;
}
export const retainedBy = (league, op) => (op?.group ? retainedFirms(league).get(op.group) ?? null : null);

/** Everyone else locked out by a pick's firm tie. */
export const firmMates = op =>
  op?.group ? OPERATIVES.filter(p => p.group === op.group && p.id !== op.id) : [];

const blocked = (league) => {
  if (league.mode === 'solo') return () => false;
  const taken = takenIds(league), firms = retainedFirms(league);
  return p => taken.has(p.id) || (p.group && firms.has(p.group));
};

export function availableFor(league, roleId) {
  const no = blocked(league);
  return BY_ROLE[roleId].filter(p => p.free || !no(p));
}
/** Everything the team could take right now, across its open slots. */
export function availableForTeam(league, team) {
  const no = blocked(league);
  return OPERATIVES.filter(p => !team.roster[p.role] && (p.free || !no(p)));
}
export function availableLanes(league) {
  const taken = new Set(league.teams.map(t => t.lane?.id).filter(Boolean));
  return LANES.filter(l => !taken.has(l.id));
}
export const openRoles = team => ROLES.filter(r => !team.roster[r.id]);

/* ── picks ────────────────────────────────────────────────────────────────*/
function advance(league) {
  league.pickInRound++;
  if (league.pickInRound >= league.teams.length) { league.pickInRound = 0; league.round++; }
  if (league.round > ROUNDS) { league.done = true; league.round = ROUNDS; }
}

export function pickLane(league, team, laneId) {
  const lane = LANE_BY_ID[laneId];
  if (!lane) throw new Error(`unknown lane ${laneId}`);
  if (league.mode !== 'solo' && league.teams.some(t => t.lane?.id === laneId)) throw new Error('lane taken');
  team.lane = lane;
  const rec = { n: pickNumber(league), round: league.round, teamIdx: team.idx, kind: 'lane', id: laneId, name: lane.name };
  team.picks.push(rec); league.picks.push(rec);
  advance(league);
  return lane;
}

export function pickOperative(league, team, operativeId) {
  const op = BY_ID[operativeId];
  if (!op) throw new Error(`unknown operative ${operativeId}`);
  if (team.roster[op.role]) throw new Error('slot filled');
  if (!op.free && league.mode !== 'solo') {
    if (takenIds(league).has(op.id)) throw new Error('Already drafted.');
    const holder = retainedFirms(league).get(op.group);
    if (holder && holder.idx !== team.idx) throw new Error(`${FIRM_GROUPS[op.group].label} is retained by ${holder.name}.`);
  }
  team.roster[op.role] = op;
  const rec = { n: pickNumber(league), round: league.round, teamIdx: team.idx, kind: 'op', id: op.id,
                name: op.name, role: op.role, fit: laneFit(op, team.lane).label };
  team.picks.push(rec); league.picks.push(rec);
  advance(league);
  return op;
}

/** Apply a pick record (from the shared store) to a league replica. */
export function applyPick(league, rec) {
  const team = league.teams[rec.teamIdx];
  return rec.kind === 'lane' ? pickLane(league, team, rec.id) : pickOperative(league, team, rec.id);
}

/* ── bots / autopick ──────────────────────────────────────────────────────*/
/**
 * What a name is worth to this team right now. Drives both the bots and the
 * "Best for my lane" board, so the two always agree.
 *
 * Value over REPLACEMENT, priced by the slot's weight -- not raw OVR nudged by
 * it. The old form multiplied the whole rating by (0.85 + 0.15 × weight),
 * which spread the entire 21-slot table across a 9% band and left the board
 * recommending an 88 press secretary over an 84 campaign manager. Scoring the
 * margin over a replacement hire instead means a merely good campaign manager
 * beats a great press secretary, which is what the weight table is for.
 *
 * A free agent rates 60 against a replacement level of 70, so it prices itself
 * below every real name and needs no special penalty -- but it still outranks a
 * cross-party hire, which is correct: you would rather have the anonymous pro.
 */
export function pickValue(op, lane, role, league, rand = Math.random) {
  const fit = laneFit(op, lane);
  const eff = op.ovr * fit.mult * FORM_MULT[op.form ?? 'N'];
  let v = (eff - K.REPLACEMENT) * role.weight;
  if (lane && !op.free && league) {
    // Scarcity is about what the slot will still offer when the clock comes
    // back, not how good this name is. A 39-deep pollster bench will still
    // have someone worth having in six rounds; a 13-deep field bench in a
    // 12-team league will not. Measure the cushion -- usable names left over
    // once every team that still needs one has taken theirs -- and pay for
    // urgency only as that cushion runs out.
    const usable = availableFor(league, role.id)
      .filter(p => !p.free && laneFit(p, lane).mult >= K.SAME_SIDE).length;
    const need = league.teams.filter(t => t.lane && !t.roster[role.id]).length;
    const urgency = Math.max(0, Math.min(1, 1 - (usable - need) / 6));
    v += 8 * role.weight * urgency;
    // Taking a partner also takes their shop off everyone else's board.
    if (op.group) v += 4 * firmMates(op).length;
  }
  // House bias, priced in the same currency. A slot's rating converts to margin
  // at weight / TOTAL_WEIGHT x OPS_SCALE, so run the pollster's margin edge back
  // through that to compare it with everyone else's value over replacement.
  if (lane) v += pollsterEdgeOf(op, lane) * TOTAL_WEIGHT / K.OPS_SCALE;
  return v + (rand() - 0.5) * 10;
}

export function bestPick(league, team, rand = league.rand || Math.random) {
  if (!team.lane) return { kind: 'lane', id: bestLane(league, rand).id };
  let best = null;
  for (const op of availableForTeam(league, team)) {
    const v = pickValue(op, team.lane, ROLE_BY_ID[op.role], league, rand);
    if (!best || v > best.v) best = { kind: 'op', id: op.id, v };
  }
  return best;
}

export function bestLane(league, rand = league.rand || Math.random) {
  const open = availableLanes(league);
  return open.map(lane => {
    let depth = 0;
    for (const role of ROLES) {
      const top = availableFor(league, role.id).filter(p => !p.free).map(p => p.ovr * laneFit(p, lane).mult).sort((a, b) => b - a)[0] ?? 60;
      depth += top * role.weight;
    }
    return { lane, v: depth + (rand() - 0.5) * 30 };
  }).sort((a, b) => b.v - a.v)[0].lane;
}

export function autopick(league, team) {
  const b = bestPick(league, team);
  return b.kind === 'lane' ? pickLane(league, team, b.id) : pickOperative(league, team, b.id);
}

/** Run bots until a human is on the clock or the draft ends. */
export function runBots(league, onPick) {
  let guard = 0;
  while (!league.done && guard++ < 1000) {
    const team = onClock(league);
    if (!team || !team.bot) break;
    const round = league.round;
    const result = autopick(league, team);   // never inside onPick?.() — that skips the call
    onPick?.(team, result, round);
  }
}

/* ── standings ────────────────────────────────────────────────────────────*/
export function leagueOpponent(league) {
  const rated = league.teams.filter(t => t.lane).map(t => rateRoster(t.roster, t.lane).overall);
  return rated.length < 2 ? undefined : rated.reduce((a, b) => a + b, 0) / rated.length;
}
export function standings(league) {
  const opponent = league.mode === 'snake' ? leagueOpponent(league) : undefined;
  return league.teams.filter(t => t.lane)
    .map(t => ({ team: t, result: scoreDraft(t, { env: league.envPoints, opponent }) }))
    .sort((a, b) => b.result.score - a.result.score);
}

/* ── share codes: lane + one char per slot + environment ──────────────────*/
const B36 = '0123456789abcdefghijklmnopqrstuvwxyz';
const ENV_IDS = ['r-wave', 'lean-r', 'tossup', 'lean-d', 'd-wave'];
export function encodeRoster(lane, roster, env) {
  let out = B36[LANES.findIndex(l => l.id === lane.id)];
  for (const role of ROLES) {
    const pick = roster[role.id];
    out += pick ? B36[BY_ROLE[role.id].findIndex(p => p.id === pick.id) + 1] : '0';
  }
  const e = ENV_IDS.indexOf(env);
  return out + B36[e < 0 ? 2 : e];
}
export function decodeRoster(code) {
  const c = String(code).trim().toLowerCase();
  if (c.length !== ROLES.length + 2) return null;
  const lane = LANES[B36.indexOf(c[0])];
  if (!lane) return null;
  const roster = {};
  ROLES.forEach((r, i) => { const idx = B36.indexOf(c[i + 1]) - 1; roster[r.id] = idx >= 0 && idx < BY_ROLE[r.id].length ? BY_ROLE[r.id][idx] : null; });
  return { lane, roster, env: ENV_IDS[B36.indexOf(c.at(-1))] || DEFAULT_ENV };
}

/* ── lane bench depth ─────────────────────────────────────────────────────*/
export const LANE_DEPTH = LANES.map(lane => {
  let sum = 0, max = 0;
  for (const role of ROLES) {
    const pool = BY_ROLE[role.id].filter(p => !p.free);
    sum += Math.max(...pool.map(p => p.ovr * laneFit(p, lane).mult)) * role.weight;
    max += Math.max(...pool.map(p => p.ovr)) * 1.1 * role.weight;
  }
  return { lane, depth: sum / max };
});
export const DEPTH_BY_LANE = Object.fromEntries(LANE_DEPTH.map(d => [d.lane.id, d.depth]));
