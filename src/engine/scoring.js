import { ROLES, ROLE_BY_ID, CATEGORIES } from '../data/roles.js';
import { LANES, LANE_BY_ID, AXES } from '../data/lanes.js';
import { STATES, FLOORS, EV_TO_WIN, EV_IN_PLAY } from '../data/map.js';
import { FORM_MULT } from '../data/operatives.js';

/* ── tuning constants ─────────────────────────────────────────────────────
 * Every number here is a gameplay dial, documented in docs/SCORING.md.
 */
export const K = {
  REPLACEMENT: 70,      // rating an empty slot is scored at
  OPPONENT: 90,         // unit rating a generic opposing campaign fields; in a
                        // league this is replaced by the field's own average, so
                        // you are measured against the room you drafted against
  ON_LANE: 1.10,        // pick is a natural fit for your lane
  SAME_SIDE: 0.92,      // right party, wrong faction
  MERCENARY: 1.00,      // works for anyone
  CROSS_PARTY: 0.62,    // you hired the other side's operative
  UNIT_SPEC: 2.4,       // unit bonus per matching spec tag
  AXIS_SPEC: 0.16,      // axis appeal per matching spec tag, before role weight
  AXIS_CAP: 2.0,        // most a roster can move one axis
  OPS_SCALE: 0.20,      // margin points per point of unit rating over baseline
  EMPHASIS_POWER: 3,    // how sharply a state's emphasis multipliers bite. The raw
                        // multipliers (1.05-1.40) barely move a ten-category
                        // weighted mean, so they are raised to this power: it is
                        // what makes a field operation actually worth more in
                        // Wisconsin than in Virginia
  AXIS_SCALE: 1.40,     // margin points per point of centered lane appeal
  AXIS_BASELINE: 0.50,  // coalition work a typical drafted roster does, measured
                        // over 2,640 simulated state-rosters; subtracted so that
                        // specialist picks are worth something only relative to
                        // what any competent operation already does
  ROSTER_COALITION: 4.0, // margin points per point of coalition work above that
  RECOUNT_BAND: 0.6,    // margin inside which the lawyers decide it
  RECOUNT_FLOOR: 84     // legal rating needed to win a recount
};

/* ── national environment ─────────────────────────────────────────────────
 * PVI is measured against the nation, so the sim needs to know what kind of
 * national year 2028 is. Values are the national margin in points, signed so
 * that POSITIVE means better for Democrats.
 *
 * A tied national popular vote does not produce a tied Electoral College on
 * this map, which is why the labels and the numbers do not line up.
 *
 * Democrats have exactly one cheap path to 270: hold the four states that lean
 * their way (NM, VA, MN, NH) and then sweep Pennsylvania, Michigan AND
 * Wisconsin, which lands on 270 on the nose. Republicans only need the Sunbelt
 * plus one. Sweeping a blue wall priced at R+2, R+1, R+2 takes a real national
 * win, so against an equally good campaign the Electoral College does not
 * become a coin flip until roughly D+3.6 — which is what the toss-up preset is
 * calibrated to, measured over 480 simulated head-to-head matchups.
 */
export const ENVIRONMENTS = [
  { id: 'r-wave',  label: 'Republican wave', sub: 'R+1 popular vote',   value: -1.0 },
  { id: 'lean-r',  label: 'Lean Republican', sub: 'D+1.5 popular vote', value:  1.5 },
  { id: 'tossup',  label: 'Toss-up',         sub: 'D+3.6 popular vote', value:  3.6 },
  { id: 'lean-d',  label: 'Lean Democratic', sub: 'D+5.5 popular vote', value:  5.5 },
  { id: 'd-wave',  label: 'Democratic wave', sub: 'D+8 popular vote',   value:  8.0 }
];
export const DEFAULT_ENV = 'tossup';
export const envValue = id => (ENVIRONMENTS.find(e => e.id === id) || ENVIRONMENTS[2]).value;

const UNIT_SPEC_MAP = {
  turnout: 'FIELD', persuasion: 'COMMS', 'earned-media': 'COMMS',
  'small-dollar': 'FINANCE', bigmoney: 'FINANCE', viral: 'DIGITAL',
  analytics: 'TECH', ops: 'OPS', legal: 'FLOATER'
};
const AXIS_SPEC_MAP = {
  union: 'union', suburban: 'college', latino: 'latino',
  black: 'black', rural: 'rural', young: 'young', senior: 'senior'
};

/* ── lane centering ───────────────────────────────────────────────────────
 * Cook PVI already encodes a generic Democrat vs. a generic Republican, so a
 * lane is only scored on how it DEVIATES from its own party's average nominee.
 * Without this, every lane would double-count its own party's baseline.
 */
const sideMean = side => {
  const ls = LANES.filter(l => l.side === side);
  const appeal = Object.fromEntries(
    AXES.map(a => [a, ls.reduce((s, l) => s + l.appeal[a], 0) / ls.length])
  );
  return { appeal, env: ls.reduce((s, l) => s + l.env, 0) / ls.length };
};
const MEANS = { D: sideMean('D'), R: sideMean('R') };

for (const lane of LANES) {
  const m = MEANS[lane.side];
  lane.appealCentered = Object.fromEntries(AXES.map(a => [a, lane.appeal[a] - m.appeal[a]]));
  lane.envCentered = lane.env - m.env;
}

/* ── fit ──────────────────────────────────────────────────────────────────*/
export function laneFit(pick, lane) {
  if (!pick) return { mult: 1, label: 'Empty', tone: 'empty' };
  if (pick.lanes.includes(lane.id)) return { mult: K.ON_LANE, label: 'On lane', tone: 'good' };
  if (pick.side === 'X') return { mult: K.MERCENARY, label: 'Mercenary', tone: 'ok' };
  if (pick.side === lane.side) return { mult: K.SAME_SIDE, label: 'Off lane', tone: 'warn' };
  return { mult: K.CROSS_PARTY, label: 'Cross-party', tone: 'bad' };
}

/** Effective rating for one pick: raw ability x lane fit x current form. */
export function effectiveRating(pick, lane) {
  if (!pick) return K.REPLACEMENT;
  return pick.ovr * laneFit(pick, lane).mult * FORM_MULT[pick.form ?? 'N'];
}

/* ── roster -> unit ratings ───────────────────────────────────────────────*/
const CAT_IDS = Object.keys(CATEGORIES);

// Share of the whole operation each unit represents, from its slots' weights.
const TOTAL_WEIGHT = ROLES.reduce((s, r) => s + r.weight, 0);
export const CAT_SHARE = Object.fromEntries(
  CAT_IDS.map(c => [c, ROLES.filter(r => r.cat === c).reduce((s, r) => s + r.weight, 0) / TOTAL_WEIGHT])
);

/**
 * roster: { [roleId]: operative | null }
 * Returns unit ratings (0-100), the team's appeal vector, and slot detail.
 */
export function rateRoster(roster, lane) {
  const num = {}, den = {}, bonus = {};
  for (const c of CAT_IDS) { num[c] = 0; den[c] = 0; bonus[c] = 0; }

  const axisAdd = Object.fromEntries(AXES.map(a => [a, 0]));
  const slots = [];

  for (const role of ROLES) {
    const pick = roster[role.id] || null;
    const fit = laneFit(pick, lane);
    const eff = effectiveRating(pick, lane);
    num[role.cat] += eff * role.weight;
    den[role.cat] += role.weight;
    slots.push({ role, pick, fit, eff });

    if (!pick) continue;
    for (const tag of pick.specs) {
      const cat = UNIT_SPEC_MAP[tag];
      if (cat) bonus[cat] += K.UNIT_SPEC * (fit.mult >= 1 ? 1 : fit.mult);
      const axis = AXIS_SPEC_MAP[tag];
      if (axis) axisAdd[axis] += K.AXIS_SPEC * role.weight * fit.mult;
    }
  }

  const units = {};
  for (const c of CAT_IDS) {
    units[c] = Math.max(0, Math.min(100, (den[c] ? num[c] / den[c] : K.REPLACEMENT) + bonus[c]));
  }

  // Kept separate: the lane's own coalition is scored against a generic nominee
  // of the same party, the roster's coalition work against a typical operation.
  const rosterAppeal = Object.fromEntries(
    AXES.map(a => [a, Math.max(-K.AXIS_CAP, Math.min(K.AXIS_CAP, axisAdd[a]))])
  );
  const appeal = Object.fromEntries(
    AXES.map(a => [a, lane.appealCentered[a] + rosterAppeal[a]])
  );

  const filled = slots.filter(s => s.pick);
  const overall = CAT_IDS.reduce((s, c) => s + units[c] * CAT_SHARE[c], 0);
  const legal = units.FLOATER + (roster['general-counsel']?.specs.includes('legal') ? 6 : 0);

  return {
    units, appeal, rosterAppeal, laneAppeal: lane.appealCentered, slots, overall, legal,
    filledCount: filled.length,
    onLane: filled.filter(s => s.fit.label === 'On lane').length,
    crossParty: filled.filter(s => s.fit.label === 'Cross-party').length,
    spend: filled.reduce((s, x) => s + x.pick.cost, 0)
  };
}

/* ── the battleground sim ─────────────────────────────────────────────────*/
/**
 * The three things one war room brings to one state, before any opponent is
 * subtracted: how its lane's coalition lands here, how much coalition work its
 * specialists do here, and how strong its operation is against what this state
 * rewards. Kept undifferenced so the same numbers drive both the solo
 * projection and a head-to-head matchup.
 */
function teamComponents(state, lane, rating) {
  const laneCoalition =
    AXES.reduce((s, a) => s + rating.laneAppeal[a] * state.electorate[a], 0) * K.AXIS_SCALE;

  const rosterDot =
    AXES.reduce((s, a) => s + rating.rosterAppeal[a] * state.electorate[a], 0);

  let opsRaw = 0, wsum = 0;
  for (const c of CAT_IDS) {
    const w = CAT_SHARE[c] * Math.pow(state.emphasis?.[c] ?? 1, K.EMPHASIS_POWER);
    opsRaw += rating.units[c] * w;
    wsum += w;
  }
  return { laneCoalition, rosterDot, opsRaw: opsRaw / wsum };
}

function stateMargin(state, lane, rating, env, opponent) {
  // 1. Cook PVI, flipped to the drafting side's point of view.
  const pvi = lane.side === 'R' ? state.pviExact : -state.pviExact;

  // 2. The national year, plus how this lane runs vs. a generic nominee.
  const year = lane.side === 'R' ? -env : env;
  const national = year + lane.envCentered;

  const c = teamComponents(state, lane, rating);
  const rosterCoalition = (c.rosterDot - K.AXIS_BASELINE) * K.ROSTER_COALITION;
  const coalition = c.laneCoalition + rosterCoalition;
  const ops = (c.opsRaw - opponent) * K.OPS_SCALE;

  return { total: pvi + national + coalition + ops, pvi, national, year,
           coalition, laneCoalition: c.laneCoalition, rosterCoalition, ops };
}

/* ── head to head ─────────────────────────────────────────────────────────
 * A league is not a set of separate counterfactuals: two war rooms on opposite
 * sides are running against EACH OTHER. Here every term is a difference, so
 * exactly one of them wins each state.
 */
export function headToHead(a, b, env = envValue(DEFAULT_ENV)) {
  if (a.lane.side === b.lane.side) return null;
  const ra = a.rating || rateRoster(a.roster, a.lane);
  const rb = b.rating || rateRoster(b.roster, b.lane);

  const results = STATES.map(state => {
    const ca = teamComponents(state, a.lane, ra);
    const cb = teamComponents(state, b.lane, rb);

    const pvi = a.lane.side === 'R' ? state.pviExact : -state.pviExact;
    const year = a.lane.side === 'R' ? -env : env;
    const national = year + a.lane.envCentered - b.lane.envCentered;
    const coalition = (ca.laneCoalition - cb.laneCoalition)
                    + (ca.rosterDot - cb.rosterDot) * K.ROSTER_COALITION;
    const ops = (ca.opsRaw - cb.opsRaw) * K.OPS_SCALE;

    let margin = pvi + national + coalition + ops;
    let recount = false;
    if (Math.abs(margin) < K.RECOUNT_BAND && margin < 0 && ra.legal - rb.legal > 6) {
      margin = 0.05; recount = true;
    }
    return { state, margin, won: margin > 0, pvi, national, coalition, ops, recount };
  });

  const evA = FLOORS[a.lane.side] + results.filter(r => r.won).reduce((s, r) => s + r.state.ev, 0);
  return { results, evA, evB: 538 - evA, winner: evA >= EV_TO_WIN ? a : b, aWon: evA >= EV_TO_WIN };
}

export function simulate(roster, lane, opts = {}) {
  const rating = opts.rating || rateRoster(roster, lane);
  const shift = opts.shift || 0;
  const env = opts.env ?? envValue(DEFAULT_ENV);
  const opponent = opts.opponent ?? K.OPPONENT;

  const results = STATES.map(state => {
    const m = stateMargin(state, lane, rating, env, opponent);
    let margin = m.total + shift;
    let recount = false;
    if (Math.abs(margin) < K.RECOUNT_BAND && margin < 0 && rating.legal >= K.RECOUNT_FLOOR) {
      margin = 0.05;
      recount = true;
    }
    return { state, ...m, margin, won: margin > 0, recount };
  });

  const ev = FLOORS[lane.side] + results.filter(r => r.won).reduce((s, r) => s + r.state.ev, 0);
  const won = ev >= EV_TO_WIN;

  // Tipping point: sort your wins from best to worst margin and walk down until
  // you cross 270. The last state you needed is the one the election turned on.
  const ordered = [...results].sort((a, b) => b.margin - a.margin);
  let running = FLOORS[lane.side], tipping = null;
  for (const r of ordered) {
    running += r.state.ev;
    if (running >= EV_TO_WIN) { tipping = r; break; }
  }

  return { results, ev, won, tipping, rating, lane, env };
}

/* ── scoring ──────────────────────────────────────────────────────────────*/
const norm = (v, lo, hi) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

export function scoreDraft(roster, lane, env = envValue(DEFAULT_ENV), opponent) {
  const rating = rateRoster(roster, lane);
  const sim = simulate(roster, lane, { rating, env, opponent });

  // Floor and ceiling: re-run the map under a national environment that breaks
  // this lane's way or against it, sized by how volatile the lane is.
  const ceiling = simulate(roster, lane, { rating, env, opponent, shift: lane.volatility });
  const floor = simulate(roster, lane, { rating, env, opponent, shift: -lane.volatility });

  const filled = Math.max(1, rating.filledCount);
  const parts = {
    map:   norm(sim.ev - FLOORS[lane.side], 0, EV_IN_PLAY),
    unit:  norm(rating.overall, 62, 94),
    fit:   rating.onLane / filled,
    tip:   norm(sim.tipping ? sim.tipping.margin : -12, -8, 8)
  };
  const score = Math.round(
    1000 * (0.45 * parts.map + 0.25 * parts.unit + 0.15 * parts.fit + 0.15 * parts.tip)
  );

  return { ...sim, score, parts, ceiling, floor };
}

export const GRADES = [
  [900, 'S',  'Landslide architecture'],
  [820, 'A+', 'Wins going away'],
  [750, 'A',  'Wins the map'],
  [680, 'B+', 'Wins an ordinary night'],
  [610, 'B',  'Live on election night'],
  [540, 'C+', 'Needs the breaks'],
  [470, 'C',  'Underdog'],
  [400, 'D',  'Structurally behind'],
  [0,   'F',  'Concession speech drafted']
];
export const gradeFor = s => GRADES.find(g => s >= g[0]);
