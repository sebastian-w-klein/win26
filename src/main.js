import { h, mount, toast } from './ui/dom.js';
import { identity } from './net/identity.js';
import { LocalStore, SharedStore } from './net/store.js';
import { createSolo, decodeRoster } from './engine/draft.js';
import { envValue } from './engine/scoring.js';
import { renderLobby } from './ui/lobby.js';
import { renderRoom } from './ui/room.js';
import { renderDraft } from './ui/draft.js';
import { renderResults } from './ui/results.js';

const root = document.getElementById('app');
const app = {
  me: identity(), db: null, room: null, peers: [], store: null, cleanup: null, draftUI: null,
  go(hash) { location.hash = hash; },
  startPractice({ teams, env, clock }) {
    app.store?.destroy?.(); app.draftUI = null;
    app.store = new LocalStore({ teams, env, clock, name: app.me.name || 'You' });
    app.go('practice');
  },
  onDraftDone() { render(); },
  say(text) { app.room?.emit('chat', { text, name: app.me.name || 'Someone' }); }
};

const frame = h('div.app', h('header.topbar', h('div.brand', 'War Room <span>Draft</span> 2028'), h('div.grow'), h('span.tiny.dim', { id: 'who' })), h('main.main', { id: 'main' }));
frame.querySelector('.brand').innerHTML = 'War Room <span>Draft</span> 2028';
frame.querySelector('.brand').style.cursor = 'pointer';
frame.querySelector('.brand').addEventListener('click', () => app.go(''));
mount(root, frame);
const main = frame.querySelector('#main');

let lastPresence = '';
function setPresence(extra = {}) {
  if (!app.room) return;
  const p = { token: app.me.token, name: app.me.name || 'Someone', ...extra };
  const key = JSON.stringify(p);
  if (key === lastPresence) return;
  lastPresence = key;
  app.room.presence(p).catch(() => {});
}

function render() {
  app.cleanup?.(); app.cleanup = null;
  frame.querySelector('#who').textContent = app.me.name ? `${app.me.name}${app.db ? ' · live' : ''}` : '';
  const hash = location.hash.replace(/^#/, '');
  const [route, arg] = hash.split('/');

  if (route === 'practice' && app.store?.kind === 'local') {
    const s = app.store;
    if (s.league.status === 'done' || s.league.done) { renderResults(main, app, s.league, 0); return; }
    app.cleanup = renderDraft(main, app, s); return;
  }
  if (route === 'roster' && arg) {
    const d = decodeRoster(arg);
    if (d) {
      const lg = createSolo({ env: d.env, humanName: 'Shared roster' });
      lg.teams[0].lane = d.lane; lg.teams[0].roster = d.roster; lg.name = 'Shared roster';
      renderResults(main, app, lg, 0); return;
    }
  }
  if (route === 'league' && arg) {
    if (!app.db) { mount(main, h('div.card.pad', h('h2', 'Connecting…'), h('p.dim.small', { style: { marginTop: '8px' } }, 'Live leagues need the shared runtime. If this page was opened outside claude.ai, use a practice draft instead.'), h('button.btn.sm.ghost', { style: { marginTop: '12px' }, onclick: () => app.go('') }, '← Home'))); return; }
    if (!(app.store?.kind === 'shared' && app.store.id === arg)) { app.store?.destroy?.(); app.draftUI = null; app.store = new SharedStore(app.db, arg, app.me); }
    const s = app.store;
    let phase = null;
    const unsub = s.subscribe(st => {
      if (st.missing) { mount(main, h('div.card.pad', h('h2', 'League not found'), h('button.btn.sm.ghost', { style: { marginTop: '12px' }, onclick: () => app.go('') }, '← Home'))); return; }
      if (!st.doc) return;
      const next = st.doc.status;
      setPresence({ league: arg, seat: st.meIdx });
      if (next === phase) { if (phase === 'lobby') renderRoom(main, app, st); return; }
      phase = next;
      if (phase === 'lobby') renderRoom(main, app, st);
      else if (phase === 'drafting') { app.cleanupDraft?.(); app.cleanupDraft = renderDraft(main, app, st); }
      else renderResults(main, app, st.league, st.meIdx);
    });
    app.cleanup = () => { unsub(); app.cleanupDraft?.(); app.cleanupDraft = null; };
    return;
  }
  setPresence({ league: null });
  app.cleanup = renderLobby(main, app);
}

window.addEventListener('hashchange', render);
render();

/* ── light up the shared runtime when it arrives ─────────────────────── */
const use = name => (window.claude?.use ? window.claude.use(name) : Promise.resolve(null)).catch(() => null);
use('db').then(db => { if (!db) return; app.db = db; render(); });
use('room').then(room => {
  if (!room) return;
  app.room = room;
  let lastOnline = '';
  room.onPeers(ch => {
    app.peers = ch.peers.filter(p => p.kind === 'viewer' && !p.isMe);
    const online = [...new Set(app.peers.map(p => p.presence?.token).filter(Boolean))].sort().join(',');
    if (online === lastOnline) return;
    lastOnline = online;
    app.onChat?.();
    if (app.store?.kind === 'shared' && app.store.doc?.status === 'lobby') renderRoom(main, app, app.store);
  });
  room.on('chat', m => { if (!app.draftUI) return; app.draftUI.chat.push({ name: m.data?.name, text: String(m.data?.text || '').slice(0, 240), at: Date.now() }); app.onChat?.(); });
  setPresence();
});
