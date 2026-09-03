/**
 * The county simulation. Every team is run through all 3,142 counties; states
 * are the vote-weighted aggregate of their counties; the Electoral College is
 * the sum of the states.
 *
 * Every margin is from the drafting side's point of view: positive means that
 * team is ahead. Every number in `K` is a gameplay dial (see docs/SCORING.md).
 */
import { COUNTY_ROWS, AXIS_STATS } from '../data/counties.js';
import { STATES, STATE_BY_ABBR, EV_TO_WIN } from '../data/states.js';
import { AXES, LANES } from '../data/lanes.js';
import { BATTLEGROUNDS } from '../data/battlegrounds.js';
import { ROLES, CATEGORIES } from '../data/roles.js';
import { FORM_MULT } from '../data/operatives.js';
import { POLLSTER_RATINGS } from '../data/pollster-ratings.js';

export const K = {
  REPLACEMENT: 70,       // rating an empty slot is scored at
  OPPONENT: 90,          // unit rating of a generic well-run opposing campaign
  ON_LANE: 1.10, SAME_SIDE: 0.92, MERCENARY: 1.00, CROSS_PARTY: 0.62,
  UNIT_SPEC: 2.4,        // unit bonus per matching spec tag, at an even slot
  AXIS_SPEC: 0.14,       // axis appeal per matching spec tag, before role weight.
                         // Scaled with the weight table: axis appeal is
                         // multiplied by role.weight, whose mean went 1.16 ->
                         // 1.33, so this came down to hold the average tag's
                         // coalition pull where it was.
  AXIS_CAP: 2.0,         // most a roster can move one axis
  COUNTY_AXIS: 0.55,     // margin points per (appeal × z-score) in a county
  Z_CLIP: 2.5,           // demographics are clipped this many SDs from the mean
  OPS_SCALE: 0.20,       // margin points per point of unit rating over the opponent
  EMPHASIS_POWER: 3,     // how sharply a state's emphasis multipliers bite
  ELASTICITY: 0.5,       // how much of a county's measured elasticity to apply.
                         // 1.0 would take the raw four-cycle number literally,
                         // which swings campaign effects 7:1 between the most
                         // and least movable counties. Half of it keeps the
                         // ordering and softens the tail.
  PROB_BASE: 1.6, PROB_VOL: 0.40,   // county logistic scale = base + vol × volatility
  STATE_PROB_BASE: 1.2, STATE_PROB_VOL: 0.30,
  POLL_BIAS: 0.08,       // margin points per point of your pollster's house bias.
                         // Deliberately small: this is measured on a firm's
                         // RELEASED polls, which are a messaging product, and is
                         // weak evidence about the private numbers it hands its
                         // own client.
  POLL_BIAS_CAP: 0.25,
  RECOUNT_BAND: 0.6, RECOUNT_FLOOR: 84
};

const CAT_IDS = Object.keys(CATEGORIES);
const TOTAL_WEIGHT = ROLES.reduce((s, r) => s + r.weight, 0);
const CAT_WEIGHT = Object.fromEntries(
  CAT_IDS.map(c => [c, ROLES.filter(r => r.cat === c).reduce((s, r) => s + r.weight, 0)]));
export const CAT_SHARE = Object.fromEntries(CAT_IDS.map(c => [c, CAT_WEIGHT[c] / TOTAL_WEIGHT]));

/**
 * How much one slot's spec tag counts inside its own unit, relative to an even
 * split of that unit. K.UNIT_SPEC used to be flat, which quietly overrode the
 * weight table: a tag was worth 2.4 unit points whether it came from the
 * campaign manager or the press secretary, while a 12-point OVR upgrade at the
 * campaign manager only moved COMMAND by 3.7. Upgrading a slot could therefore
 * make a roster WORSE if the better operative happened to carry one tag fewer,
 * which is exactly what the deputy CM and creative director slots did.
 */
const CAT_COUNT = Object.fromEntries(CAT_IDS.map(c => [c, ROLES.filter(r => r.cat === c).length]));
export const SPEC_SHARE = Object.fromEntries(
  ROLES.map(r => [r.id, r.weight / CAT_WEIGHT[r.cat] * CAT_COUNT[r.cat]]));

const UNIT_SPEC_MAP = {
  turnout: 'FIELD', persuasion: 'COMMS', 'earned-media': 'COMMS', 'small-dollar': 'FINANCE',
  bigmoney: 'FINANCE', viral: 'DIGITAL', analytics: 'TECH', ops: 'OPS', legal: 'FLOATER'
};
const AXIS_SPEC_MAP = {
  union: 'union', suburban: 'college', latino: 'latino', black: 'black', rural: 'rural',
  young: 'young', senior: 'senior',
  noncollege: 'ncwhite',   // organizers and admen who work non-college white turf
  affluent: 'income',      // the donor-and-suburb operation
  outsider: 'protest'      // people who can talk to voters who have quit both parties
};

/* ── counties, z-scored once ────────────────────────────────────────────── */
const clip = v => Math.max(-K.Z_CLIP, Math.min(K.Z_CLIP, v));
export const COUNTIES = COUNTY_ROWS.map(r => {
  const st = STATE_BY_ABBR[r[2]];
  const z = {
    college: clip((r[5] - AXIS_STATS.college.mean) / AXIS_STATS.college.sd),
    latino:  clip((r[6] - AXIS_STATS.latino.mean) / AXIS_STATS.latino.sd),
    black:   clip((r[7] - AXIS_STATS.black.mean) / AXIS_STATS.black.sd),
    rural:   clip((r[8] - AXIS_STATS.rural.mean) / AXIS_STATS.rural.sd),
    young:   clip((r[9] - AXIS_STATS.young.mean) / AXIS_STATS.young.sd),
    senior:  clip((r[10] - AXIS_STATS.senior.mean) / AXIS_STATS.senior.sd),
    ncwhite: clip((r[11] - AXIS_STATS.ncwhite.mean) / AXIS_STATS.ncwhite.sd),
    income:  clip((r[12] - AXIS_STATS.income.mean) / AXIS_STATS.income.sd),
    protest: clip((r[13] - AXIS_STATS.protest.mean) / AXIS_STATS.protest.sd),
    union:   clip((st.union - AXIS_STATS.union.mean) / AXIS_STATS.union.sd)
  };
  // Elasticity is measured, not assumed: it is how far this county's lean has
  // moved from cycle to cycle across 2012, 2016, 2020 and 2024, normalized so
  // the vote-weighted national county is exactly 1.00. K.ELASTICITY decides how
  // literally to take it.
  const elastic = 1 + K.ELASTICITY * (r[14] - 1);
  return { fips: r[0], name: r[1], st: r[2], lean: r[3], votes: r[4], z, elastic,
           demo: { college: r[5], latino: r[6], black: r[7], rural: r[8], young: r[9], senior: r[10],
                   ncwhite: r[11], income: r[12], protest: r[13], elasticity: r[14],
                   drift: r[15], growth: r[16], rucc: r[17], union: st.union } };
});
export const COUNTY_BY_FIPS = Object.fromEntries(COUNTIES.map(c => [c.fips, c]));
const COUNTIES_BY_STATE = {};
for (const c of COUNTIES) (COUNTIES_BY_STATE[c.st] ||= []).push(c);

/* ── lanes, centered on their own side ──────────────────────────────────── */
for (const side of ['D', 'R']) {
  const ls = LANES.filter(l => l.side === side);
  const mean = Object.fromEntries(AXES.map(a => [a, ls.reduce((s, l) => s + l.appeal[a], 0) / ls.length]));
  const envMean = ls.reduce((s, l) => s + l.env, 0) / ls.length;
  for (const l of ls) {
    l.appealCentered = Object.fromEntries(AXES.map(a => [a, l.appeal[a] - mean[a]]));
    l.envCentered = l.env - envMean;
  }
}

/* ── fit + rating ────────────────────────────────────────────────────────── */
export function laneFit(pick, lane) {
  if (!pick) return { mult: 1, label: 'Empty', tone: 'empty' };
  if (pick.free) return { mult: K.MERCENARY, label: 'Free agent', tone: 'ok' };
  if (lane && pick.lanes.includes(lane.id)) return { mult: K.ON_LANE, label: 'On lane', tone: 'good' };
  if (pick.side === 'X') return { mult: K.MERCENARY, label: 'Mercenary', tone: 'ok' };
  if (lane && pick.side === lane.side) return { mult: K.SAME_SIDE, label: 'Off lane', tone: 'warn' };
  return { mult: K.CROSS_PARTY, label: 'Cross-party', tone: 'bad' };
}
export const effectiveRating = (pick, lane) =>
  pick ? pick.ovr * laneFit(pick, lane).mult * FORM_MULT[pick.form ?? 'N'] : K.REPLACEMENT;

/** roster: { [roleId]: operative | null } → units, appeal, slots. */
export function rateRoster(roster, lane) {
  const num = {}, den = {}, bonus = {};
  for (const c of CAT_IDS) { num[c] = 0; den[c] = 0; bonus[c] = 0; }
  const axisAdd = Object.fromEntries(AXES.map(a => [a, 0]));
  const slots = [];
  for (const role of ROLES) {
    const pick = roster[role.id] || null;
    const fit = laneFit(pick, lane), eff = effectiveRating(pick, lane);
    num[role.cat] += eff * role.weight; den[role.cat] += role.weight;
    slots.push({ role, pick, fit, eff });
    if (!pick) continue;
    for (const tag of pick.specs) {
      const cat = UNIT_SPEC_MAP[tag];
      if (cat) bonus[cat] += K.UNIT_SPEC * SPEC_SHARE[role.id] * Math.min(1, fit.mult);
      const axis = AXIS_SPEC_MAP[tag]; if (axis) axisAdd[axis] += K.AXIS_SPEC * role.weight * fit.mult;
    }
  }
  const units = {};
  for (const c of CAT_IDS) units[c] = Math.max(0, Math.min(100, num[c] / den[c] + bonus[c]));
  const rosterAppeal = Object.fromEntries(AXES.map(a => [a, Math.max(-K.AXIS_CAP, Math.min(K.AXIS_CAP, axisAdd[a]))]));
  const appeal = Object.fromEntries(AXES.map(a => [a, (lane ? lane.appealCentered[a] : 0) + rosterAppeal[a]]));
  // Your chief pollster's published house bias, positive toward Democrats.
  const pollster = roster['chief-pollster'];
  const houseBias = pollster?.firm ? (POLLSTER_RATINGS[pollster.firm]?.bias ?? 0) : 0;

  const filled = slots.filter(s => s.pick);
  return {
    units, appeal, rosterAppeal, houseBias, laneAppeal: lane ? lane.appealCentered : {}, slots,
    overall: CAT_IDS.reduce((s, c) => s + units[c] * CAT_SHARE[c], 0),
    legal: units.FLOATER + (roster['general-counsel']?.specs.includes('legal') ? 6 : 0),
    filledCount: filled.length,
    onLane: filled.filter(s => s.fit.label === 'On lane').length,
    crossParty: filled.filter(s => s.fit.label === 'Cross-party').length,
    freeAgents: filled.filter(s => s.pick.free).length,
    spend: filled.reduce((s, x) => s + x.pick.cost, 0)
  };
}

/** Unit strength as one number per state, given what that state rewards. */
function opsByState(units) {
  const out = {};
  for (const st of STATES) {
    const em = BATTLEGROUNDS[st.abbr]?.emphasis || {};
    let raw = 0, w = 0;
    for (const c of CAT_IDS) { const k = CAT_SHARE[c] * Math.pow(em[c] ?? 1, K.EMPHASIS_POWER); raw += units[c] * k; w += k; }
    out[st.abbr] = raw / w;
  }
  return out;
}

/* ── a team prepared for the sim ─────────────────────────────────────────── */
export function prepare(team) {
  const rating = team.rating || rateRoster(team.roster, team.lane);
  return { ...team, rating, ops: opsByState(rating.units) };
}

const logistic = (m, s) => 1 / (1 + Math.exp(-m / s));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * What your own pollster's history does to you. A firm whose published polls
 * have historically overstated YOUR side flatters you into spending in the
 * wrong places; one that has been tough on your side keeps you running scared.
 * Returns margin points, positive when the pollster helps you.
 */
export function pollingEdge(rating, side) {
  const flatter = (side === 'D' ? 1 : -1) * (rating.houseBias || 0);
  return clamp(-flatter * K.POLL_BIAS, -K.POLL_BIAS_CAP, K.POLL_BIAS_CAP);
}

/**
 * Run one team through every county and state.
 *  env      national popular-vote margin, D-positive
 *  opponent unit rating of the opposition (generic, or the league field)
 *  shift    uniform national swing, for floor/ceiling
 *  vs       another prepared team on the other side → true head-to-head
 */
export function simulate(team, { env = 0, opponent = K.OPPONENT, shift = 0, vs = null } = {}) {
  const T = prepare(team), V = vs ? prepare(vs) : null;
  const lane = T.lane, sign = lane.side === 'D' ? 1 : -1;
  const national = sign * env + lane.envCentered - (V ? V.lane.envCentered : 0) + shift;
  const sCounty = K.PROB_BASE + K.PROB_VOL * lane.volatility;
  const sState = K.STATE_PROB_BASE + K.STATE_PROB_VOL * lane.volatility;

  const appeal = AXES.map(a => T.rating.appeal[a] - (V ? V.rating.appeal[a] : 0));
  const polling = pollingEdge(T.rating, lane.side) - (V ? pollingEdge(V.rating, V.lane.side) : 0);
  const counties = new Array(COUNTIES.length);
  const stateAgg = {};
  for (let i = 0; i < COUNTIES.length; i++) {
    const c = COUNTIES[i];
    let coalition = 0;
    for (let j = 0; j < AXES.length; j++) coalition += appeal[j] * c.z[AXES[j]];
    coalition *= K.COUNTY_AXIS;
    // Everything a campaign controls — who its coalition is, how good its
    // operation is, whose polls it believes — lands harder in a county whose
    // voters have actually been moving, and barely registers in one that has
    // voted the same way for four cycles.
    const ops = (T.ops[c.st] - (V ? V.ops[c.st] : opponent)) * K.OPS_SCALE;
    const campaign = (coalition + ops + polling) * c.elastic;
    const margin = sign * c.lean + national + campaign;
    counties[i] = { c, margin, p: logistic(margin, sCounty), coalition: coalition * c.elastic, ops: ops * c.elastic };
    const s = (stateAgg[c.st] ||= { m: 0, w: 0, coal: 0, ops: 0 });
    s.m += margin * c.votes; s.w += c.votes; s.coal += coalition * c.votes; s.ops += ops * c.votes;
  }

  const states = STATES.map(st => {
    const a = stateAgg[st.abbr];
    let margin = a.m / a.w, recount = false;
    const legalEdge = V ? T.rating.legal - V.rating.legal > 6 : T.rating.legal >= K.RECOUNT_FLOOR;
    if (margin < 0 && margin > -K.RECOUNT_BAND && legalEdge) { margin = 0.05; recount = true; }
    return { st, margin, p: logistic(margin, sState), won: margin > 0, recount,
             lean: sign * st.lean, coalition: a.coal / a.w, ops: a.ops / a.w, national };
  });

  const ev = states.filter(s => s.won).reduce((s, x) => s + x.st.ev, 0);
  const expectedEv = states.reduce((s, x) => s + x.st.ev * x.p, 0);
  const ordered = [...states].sort((a, b) => b.margin - a.margin);
  let running = 0, tipping = null;
  for (const s of ordered) { running += s.st.ev; if (running >= EV_TO_WIN) { tipping = s; break; } }

  return { team: T, vs: V, counties, states, ev, evOpp: 538 - ev, expectedEv, won: ev >= EV_TO_WIN, tipping, env, national, polling };
}

export { COUNTIES_BY_STATE };
