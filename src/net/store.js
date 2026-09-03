/**
 * Two league stores with one interface, so the draft room does not care
 * whether it is a practice draft against bots or a live league of coworkers.
 *
 *   store.league        the current league replica (engine shape)
 *   store.meIdx         my seat index, or -1
 *   store.subscribe(fn) fn(store) on every change; returns unsubscribe
 *   store.join(idx, name) / store.leave()
 *   store.start(settings) / store.pick(rec) / store.autopickNow()
 *   store.clockRemaining()  seconds left on the current pick, or null
 *
 * SharedStore keeps one document per league at leagues/{id}:
 *   { name, createdAt, owner, status, settings, seats, picks, clockStart }
 * Everyone subscribes with onSnapshot and REPLAYS the pick list into a fresh
 * engine league, so every browser derives identical state from the same
 * record. Whoever holds the clock lease makes bot picks and enforces the
 * clock; the lease moves on its own if that browser goes away.
 */
import { ROLES } from '../data/roles.js';
import {
  createLeague, makeTeam, applyPick, onClock, bestPick, pickLane, pickOperative,
  runBots, ROUNDS, WAR_ROOM_NAMES, DEFAULT_CLOCK, rng
} from '../engine/draft.js';
import { envValue } from '../engine/scoring.js';

/* ── shared helpers ───────────────────────────────────────────────────────*/
function buildLeague(doc) {
  const s = doc.settings;
  const lg = createLeague({ teams: s.teams, env: s.env, seed: doc.seed || 1, clock: s.clock ?? DEFAULT_CLOCK });
  lg.rand = rng(doc.seed || 1);
  lg.teams = doc.seats.map((seat, i) => makeTeam(i, seat?.name || WAR_ROOM_NAMES[i % WAR_ROOM_NAMES.length], { human: !!seat && !seat.bot, bot: !seat || !!seat.bot }));
  for (const rec of doc.picks || []) { try { applyPick(lg, rec); } catch (e) { console.warn('bad pick in record', rec, e.message); } }
  lg.status = doc.status; lg.name = doc.name; lg.owner = doc.owner; lg.clockStart = doc.clockStart || null;
  return lg;
}

class Base {
  constructor() { this.subs = new Set(); }
  subscribe(fn) { this.subs.add(fn); fn(this); return () => this.subs.delete(fn); }
  notify() { for (const fn of this.subs) fn(this); }
  get onClockTeam() { return this.league && !this.league.done ? onClock(this.league) : null; }
  get isMyTurn() { const t = this.onClockTeam; return !!t && t.idx === this.meIdx; }
  clockRemaining() {
    const lg = this.league;
    if (!lg || !lg.clock || !lg.clockStart || lg.done || lg.status !== 'drafting') return null;
    return Math.max(0, Math.round((lg.clockStart + lg.clock * 1000 - Date.now()) / 1000));
  }
}

/* ── practice: everything local ───────────────────────────────────────────*/
export class LocalStore extends Base {
  constructor({ teams, env, name, clock = 0 }) {
    super();
    this.league = createLeague({ teams, env, humanName: name || 'You', clock });
    this.league.status = 'drafting'; this.league.name = 'Practice draft'; this.league.owner = 'me';
    this.league.clockStart = Date.now();
    this.meIdx = 0; this.kind = 'local';
    this.timer = setInterval(() => this.tick(), 500);
    this.botDelay = 700;
    this.pending = false;
    queueMicrotask(() => this.drive());
  }
  destroy() { clearInterval(this.timer); }
  /** Bots pick one at a time with a short delay so the feed reads like a draft. */
  drive() {
    if (this.pending || this.league.done) return;
    const t = onClock(this.league);
    if (!t || !t.bot) return;
    this.pending = true;
    setTimeout(() => {
      const b = bestPick(this.league, t);
      b.kind === 'lane' ? pickLane(this.league, t, b.id) : pickOperative(this.league, t, b.id);
      this.league.clockStart = Date.now();
      this.pending = false;
      if (this.league.done) this.league.status = 'done';
      this.notify(); this.drive();
    }, this.botDelay);
  }
  tick() {
    const r = this.clockRemaining();
    if (r === 0 && this.isMyTurn) this.autopickNow();
    else if (r !== null) this.notify();
  }
  async pick(rec) {
    const t = this.league.teams[rec.teamIdx];
    rec.kind === 'lane' ? pickLane(this.league, t, rec.id) : pickOperative(this.league, t, rec.id);
    this.league.clockStart = Date.now();
    if (this.league.done) this.league.status = 'done';
    this.notify(); this.drive();
  }
  async autopickNow() {
    const t = this.onClockTeam; if (!t) return;
    const b = bestPick(this.league, t);
    return this.pick({ kind: b.kind, id: b.id, teamIdx: t.idx });
  }
  finish() { this.league.status = 'done'; this.league.done = true; this.notify(); }
}

/* ── live: the artifact's shared document store ───────────────────────────*/
export class SharedStore extends Base {
  constructor(db, id, me) {
    super();
    this.db = db; this.id = id; this.me = me; this.kind = 'shared';
    this.ref = db.doc(`leagues/${id}`);
    this.lock = db.doc(`leagues/${id}/locks/clock`);
    this.doc = null; this.league = null; this.meIdx = -1; this.holdsClock = false;
    this.unsub = this.ref.onSnapshot(snap => this.onDoc(snap), e => { this.error = e; this.notify(); });
    this.timer = setInterval(() => this.tick(), 1000);
  }
  destroy() { this.unsub?.(); clearInterval(this.timer); }

  onDoc(snap) {
    if (!snap.exists) { this.missing = true; this.notify(); return; }
    this.doc = snap.data();
    this.league = buildLeague(this.doc);
    this.meIdx = this.doc.seats.findIndex(s => s && s.token === this.me.token);
    this.notify();
  }

  get isOwner() { return this.doc?.owner === this.me.token; }
  get seatsOpen() { return this.doc ? this.doc.seats.filter(s => !s).length : 0; }

  /* --- seats --------------------------------------------------------- */
  async join(idx, name) {
    if (this.doc?.seats[idx] && this.doc.seats[idx].token !== this.me.token) throw new Error('That seat is taken.');
    // Claim idiom, per seat: lease that seat's lock, re-read, write only if
    // the seat is still empty. Two people joining different seats never collide.
    const got = await this.db.doc(`leagues/${this.id}/locks/seat${idx}`).acquire({ holder: this.me.token, ttlMs: 2500 });
    if (!got.acquired) throw new Error('Someone else is grabbing that seat — try another.');
    const snap = await this.ref.get();
    const doc = snap.data();
    if (doc.status !== 'lobby') throw new Error('The draft has already started.');
    const seats = [...doc.seats];
    const already = seats.findIndex(s => s && s.token === this.me.token);
    if (already >= 0) seats[already] = null;
    if (seats[idx]) throw new Error('That seat was just taken.');
    seats[idx] = { name, token: this.me.token, joinedAt: Date.now(), bot: false };
    await this.ref.update({ seats });
  }
  async leave() {
    if (this.meIdx < 0 || this.doc.status !== 'lobby') return;
    const seats = [...this.doc.seats]; seats[this.meIdx] = null;
    await this.ref.update({ seats });
  }
  async rename(idx, name) {
    const seats = [...this.doc.seats]; if (seats[idx]) seats[idx] = { ...seats[idx], name };
    await this.ref.update({ seats });
  }

  /* --- lifecycle ------------------------------------------------------ */
  async start() {
    if (!this.isOwner) throw new Error('Only the commissioner can start the draft.');
    const seats = this.doc.seats.map((s, i) => s || { name: WAR_ROOM_NAMES[i % WAR_ROOM_NAMES.length], token: null, bot: true, joinedAt: Date.now() });
    await this.ref.update({ status: 'drafting', seats, clockStart: Date.now(), seed: Math.floor(Math.random() * 1e9) });
  }
  async updateSettings(patch) {
    if (!this.isOwner) return;
    const settings = { ...this.doc.settings, ...patch };
    let seats = this.doc.seats;
    if (patch.teams && patch.teams !== seats.length) {
      seats = [...Array(patch.teams).keys()].map(i => seats[i] || null);
    }
    await this.ref.update({ settings, seats });
  }

  /* --- picks ---------------------------------------------------------- */
  async pick(rec) {
    const lg = this.league;
    const t = onClock(lg);
    if (!t || t.idx !== rec.teamIdx) throw new Error('Not on the clock.');
    // Validate against the replica before writing (throws on taken/filled).
    const probe = buildLeague(this.doc);
    applyPick(probe, { ...rec, n: probe.picks.length + 1 });
    const picks = [...(this.doc.picks || []), { n: lg.picks.length + 1, round: lg.round, teamIdx: rec.teamIdx, kind: rec.kind, id: rec.id }];
    const done = picks.length >= lg.teams.length * ROUNDS;
    await this.ref.update({ picks, clockStart: Date.now(), ...(done ? { status: 'done' } : {}) });
  }
  async autopickNow(teamIdx) {
    const t = this.onClockTeam; if (!t || (teamIdx != null && t.idx !== teamIdx)) return;
    const b = bestPick(this.league, t);
    return this.pick({ kind: b.kind, id: b.id, teamIdx: t.idx });
  }

  /* --- clock keeper ---------------------------------------------------- */
  async tick() {
    const lg = this.league;
    if (!lg || lg.status !== 'drafting' || lg.done) return;
    this.notify(); // clock display
    // Try to hold the clock. Whoever holds it moves bots and expired humans.
    try {
      const r = await this.lock.acquire({ holder: this.me.token, ttlMs: 6000 });
      this.holdsClock = r.acquired;
    } catch { this.holdsClock = false; }
    if (!this.holdsClock) return;
    const t = onClock(lg);
    if (!t) return;
    const elapsed = (Date.now() - (lg.clockStart || 0)) / 1000;
    if (t.bot && elapsed >= 1.0) await this.safe(() => this.autopickNow(t.idx));
    else if (!t.bot && lg.clock && elapsed >= lg.clock + 2) await this.safe(() => this.autopickNow(t.idx));
  }
  async safe(fn) { try { await fn(); } catch (e) { /* another keeper got there first */ } }
}

/* ── lobby helpers ────────────────────────────────────────────────────────*/
export async function createSharedLeague(db, me, { name, teams = 8, env = 'tossup', clock = DEFAULT_CLOCK }) {
  const ref = await db.collection('leagues').add({
    name, createdAt: Date.now(), owner: me.token, status: 'lobby',
    settings: { teams, env, clock },
    seats: [...Array(teams)].map(() => null),
    picks: [], clockStart: null, seed: Math.floor(Math.random() * 1e9)
  });
  return ref.id;
}

export function watchLeagues(db, fn) {
  return db.collection('leagues').orderBy('createdAt', 'desc').limit(40)
    .onSnapshot(snap => fn(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => fn([], e));
}

export async function deleteLeague(db, id) { await db.doc(`leagues/${id}`).delete(); }
