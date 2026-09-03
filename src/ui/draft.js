/** The draft room: clock, players, board, my team, feed. */
import { h, mount, toast, initials } from './dom.js';
import { ROLES, ROLE_BY_ID, CATEGORIES } from '../data/roles.js';
import { LANES, SIDE } from '../data/lanes.js';
import { laneFit } from '../engine/sim.js';
import { scoreDraft, gradeFor } from '../engine/scoring.js';
import { availableForTeam, availableLanes, picksUntil, pickValue, ROUNDS, fullOrder, onClock, firmMates } from '../engine/draft.js';
import { laneCard } from './lanes.js';
import { pollsterChips, pollsterDetail } from './pollster.js';
import { FIRM_GROUPS } from '../data/operatives.js';

const FORM = { W: ['good', 'Won'], L: ['bad', 'Lost'], N: ['', '—'] };
const fitClass = f => f.tone === 'good' ? 'good' : f.tone === 'bad' ? 'bad' : f.tone === 'warn' ? 'warn' : '';

export function renderDraft(root, app, store) {
  const ui = app.draftUI ||= { tab: 'players', role: 'all', query: '', sort: 'best', queue: [], selected: null, chat: [] };
  let lastKey = '';
  const lg = () => store.league;
  const me = () => lg().teams[store.meIdx] || null;

  /* ── pieces that update every second ──────────────────────────────── */
  const clockEl = h('div.clock', '—');
  function paintClock() {
    const r = store.clockRemaining();
    clockEl.textContent = r == null ? (lg().clock ? '—' : '∞') : `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
    clockEl.classList.toggle('low', r != null && r <= 10);
  }

  /* ── panes ──────────────────────────────────────────────────────────── */
  function clockbar() {
    const t = onClock(lg());
    const mine = !!t && t.idx === store.meIdx;
    const nextIn = me() ? picksUntil(lg(), store.meIdx) : Infinity;
    const round = lg().round;
    return h('div.clockbar', { class: mine ? 'mine' : '' },
      clockEl,
      h('div.grow',
        h('div.who', mine ? 'You’re on the clock' : t ? `${t.name} is on the clock` : 'Draft complete'),
        h('div.next', `Round ${round} of ${ROUNDS} · Pick ${lg().picks.length + 1}` + (round === 1 ? ' · Lane round' : '') +
          (!mine && me() && nextIn !== Infinity ? ` · you pick in ${nextIn}` : ''))
      ),
      mine && h('button.btn.sm.secondary', { onclick: () => store.autopickNow() }, 'Autopick')
    );
  }

  function playersPane() {
    const team = me();
    const L = lg();
    const myTurn = store.isMyTurn;
    if (!team) return h('div.card.pad.dim', 'You’re watching this draft. Take a seat next time to play.');

    // Lane round: pick a lane.
    if (!team.lane) {
      const takenBy = Object.fromEntries(L.teams.filter(t => t.lane).map(t => [t.lane.id, t.name]));
      return h('div',
        h('p.dim.small', { style: { marginBottom: '10px' } }, myTurn ? 'Pick your lane. It’s exclusive — once it’s gone, it’s gone.' : 'Lanes still on the board. You’ll pick when you’re on the clock.'),
        h('div.lane-grid', LANES.map(lane => laneCard(lane, { disabled: !myTurn || !!takenBy[lane.id], takenBy: takenBy[lane.id],
          onPick: l => store.pick({ kind: 'lane', id: l.id, teamIdx: team.idx }).catch(e => toast(e.message, 'bad')) })))
      );
    }

    let pool = availableForTeam(L, team);
    if (ui.role !== 'all') pool = pool.filter(p => p.role === ui.role);
    const q = ui.query.trim().toLowerCase();
    if (q) pool = pool.filter(p => p.name.toLowerCase().includes(q) || p.org.toLowerCase().includes(q) || p.credit.toLowerCase().includes(q));
    const val = p => pickValue(p, team.lane, ROLE_BY_ID[p.role], L, () => 0.5);
    const sorters = { best: (a, b) => val(b) - val(a), ovr: (a, b) => b.ovr - a.ovr, cost: (a, b) => a.cost - b.cost, name: (a, b) => a.name.localeCompare(b.name) };
    pool.sort(sorters[ui.sort]);
    const queued = new Set(ui.queue);
    const queueFirst = ui.queue.find(id => pool.some(p => p.id === id));

    const row = p => {
      const fit = laneFit(p, team.lane), role = ROLE_BY_ID[p.role];
      const [ft, fw] = FORM[p.form ?? 'N'];
      return h('button.player', { class: ui.selected === p.id ? 'sel' : '', style: { '--cat': CATEGORIES[role.cat].color }, onclick: () => { ui.selected = ui.selected === p.id ? null : p.id; repaint('players'); } },
        h('div.avatar', p.free ? 'FA' : initials(p.name)),
        h('div.grow',
          h('div.name', p.name, queued.has(p.id) && h('span.chip.accent', { style: { marginLeft: '6px' } }, p.id === queueFirst ? 'Next in queue' : 'Queued')),
          h('div.meta', `${role.title} · ${p.org}`),
          h('div.chips', h('span.chip', { class: fitClass(fit) }, fit.label), p.form !== 'N' && h('span.chip', { class: ft }, `${fw} · ${p.formCycle}`), pollsterChips(p, team.lane?.side),
            p.group && firmMates(p).length > 0 && h('span.chip.accent', {
              title: `One hire with ${FIRM_GROUPS[p.group].label}. Drafting this also takes ${firmMates(p).map(m => m.name).join(', ')} off the board for every war room.`
            }, firmMates(p).length === 1 ? `+ ${firmMates(p)[0].name}` : `+ ${firmMates(p).length} more`),
            ...p.specs.map(s => h('span.chip', s)))
        ),
        h('div', h('div.ovr', { style: { color: p.ovr >= 88 ? 'var(--accent)' : p.ovr >= 80 ? 'var(--ink)' : 'var(--ink-dim)' } }, p.ovr), h('div.cost', `${p.cost} cr`)),
        ui.selected === p.id && h('div.credit', p.credit,
          p.group && firmMates(p).length > 0 && h('p.tiny', { style: { marginTop: '6px', color: 'var(--accent)' } },
            `Firm tie — ${p.name} and ${firmMates(p).map(m => m.name).join(' and ')} are one hire at ${FIRM_GROUPS[p.group].label}. Drafting this takes the ${firmMates(p).length === 1 ? 'other' : 'others'} off the board for every war room.`),
          pollsterDetail(p, team.lane?.side))
      );
    };

    const sel = ui.selected ? pool.find(p => p.id === ui.selected) || availableForTeam(L, team).find(p => p.id === ui.selected) : null;
    return h('div.card',
      h('div.filters',
        h('input.input.grow', { type: 'search', placeholder: 'Search names, firms, credits', value: ui.query, oninput: e => { ui.query = e.target.value; repaint('players'); } }),
        h('select.input', { style: { width: 'auto' }, onchange: e => { ui.sort = e.target.value; repaint('players'); } },
          [['best', 'Best for my lane'], ['ovr', 'Highest OVR'], ['cost', 'Cheapest'], ['name', 'Name']].map(([v, l]) => h('option', { value: v, selected: ui.sort === v }, l)))
      ),
      h('div.role-tabs',
        h('button', { 'aria-pressed': String(ui.role === 'all'), onclick: () => { ui.role = 'all'; repaint('players'); } }, 'All open'),
        ROLES.map(r => h('button', { 'aria-pressed': String(ui.role === r.id), class: team.roster[r.id] ? 'filled' : '', style: { '--cat': CATEGORIES[r.cat].color }, onclick: () => { ui.role = r.id; repaint('players'); } }, r.title))
      ),
      h('div.plist', pool.length ? pool.map(row) : h('div.pad.dim.small', { style: { padding: '16px' } }, 'Nothing left here — take a free agent from another slot or clear the filter.')),
      sel && h('div.sheet',
        h('div.row', h('div.grow', h('div', { style: { fontWeight: 700 } }, sel.name), h('div.tiny.dim', `${ROLE_BY_ID[sel.role].title} · ${laneFit(sel, team.lane).label}`)),
          h('button.btn.sm.ghost', { onclick: () => { ui.selected = null; repaint('players'); } }, 'Close')),
        h('div.row',
          myTurn ? h('button.btn.grow', { onclick: () => store.pick({ kind: 'op', id: sel.id, teamIdx: team.idx }).then(() => {
                     ui.selected = null;
                     ui.queue = ui.queue.filter(x => x !== sel.id);
                     // That slot is now filled, so its tab would show an empty list.
                     if (ui.role === sel.role) ui.role = 'all';
                   }).catch(e => toast(e.message, 'bad')) }, `Draft ${sel.name}`)
                 : h('button.btn.grow.secondary', { onclick: () => { if (!queued.has(sel.id)) ui.queue.push(sel.id); else ui.queue = ui.queue.filter(x => x !== sel.id); repaint('players'); } }, queued.has(sel.id) ? 'Remove from queue' : 'Add to my queue')
        )
      )
    );
  }

  function boardPane() {
    const L = lg();
    const order = fullOrder(L);
    const byCell = {};
    for (const p of L.picks) byCell[`${p.round}:${p.teamIdx}`] = p;
    const current = order[L.picks.length];
    return h('div.card',
      h('div.board-wrap', h('table.board',
        h('thead', h('tr', h('th', ''), L.teams.map(t => h('th', { class: t.idx === store.meIdx ? 'me' : '' }, t.name, h('div.faint', { style: { fontWeight: 400 } }, t.lane ? t.lane.short : '·'))))),
        h('tbody', [...Array(ROUNDS).keys()].map(i => {
          const r = i + 1;
          return h('tr', h('td.rnd', r === 1 ? 'Lane' : `R${r}`), L.teams.map(t => {
            const p = byCell[`${r}:${t.idx}`];
            const now = current && current.round === r && current.teamIdx === t.idx;
            if (!p) return h('td', h('div.pickcard.empty', { class: now ? 'now' : '' }, now ? h('span.n', 'On the clock') : ''));
            if (p.kind === 'lane') { const lane = LANES.find(l => l.id === p.id); return h('td', h('div.pickcard.lane', { style: { '--side': SIDE[lane.side].color } }, h('span.n', lane.name))); }
            const role = ROLE_BY_ID[p.role];
            return h('td', h('div.pickcard', { style: { '--cat': CATEGORIES[role.cat].color } }, h('span.n', p.name), h('span.r', role.title)));
          }));
        }))
      ))
    );
  }

  function teamPane() {
    const team = me();
    if (!team) return h('div.card.pad.dim', 'Spectating.');
    let proj = null;
    const filledN = Object.values(team.roster).filter(Boolean).length;
    if (team.lane && filledN >= 3) { try { proj = scoreDraft(team, { env: lg().envPoints }); } catch {} }
    return h('div.stack',
      h('div.card.pad',
        h('div.row', h('div.grow', h('h3', team.name), h('div.small.dim', team.lane ? `${team.lane.name} · ${SIDE[team.lane.side].name}` : 'No lane yet')),
          proj && h('div', { style: { textAlign: 'right' } }, h('div.label', 'Projected'), h('div', { style: { fontFamily: 'var(--display)', fontWeight: 800, fontSize: '26px', lineHeight: 1 } }, `${proj.ev} EV`), h('div.tiny.dim', `${gradeFor(proj.score)[1]} · ${proj.rating.onLane}/${proj.rating.filledCount} on lane`)))
      ),
      h('div.roster', ROLES.map(r => {
        const p = team.roster[r.id];
        return h('div.slotrow', { class: p ? '' : 'empty', style: { '--cat': CATEGORIES[r.cat].color } },
          h('span.n', r.n), h('div', h('div.role', r.title), h('div.who', p ? p.name : '—')),
          p && team.lane && h('span.chip', { class: fitClass(laneFit(p, team.lane)) }, laneFit(p, team.lane).label));
      })),
      ui.queue.length > 0 && h('div.card.pad', h('div.label', { style: { marginBottom: '6px' } }, 'My queue'),
        h('div.stack', ui.queue.map(id => { const p = availableForTeam(lg(), team).find(x => x.id === id); return h('div.row.small', h('span.grow', p ? p.name : h('span.faint', 'Taken')), h('button.btn.sm.ghost', { onclick: () => { ui.queue = ui.queue.filter(x => x !== id); repaint('team'); } }, '×')); })))
    );
  }

  function feedPane() {
    const L = lg();
    const items = [...L.picks].reverse().map(p => {
      const t = L.teams[p.teamIdx];
      return h('div.feed-item', h('span.pn', `#${p.n}`), h('div', h('b', t.name), p.kind === 'lane' ? ` takes the ${p.name} lane` : ` drafts ${p.name}`, p.kind === 'op' && h('span.dim', ` · ${ROLE_BY_ID[p.role].title}`)));
    });
    const chat = ui.chat.slice(-40).reverse().map(m => h('div.feed-item', h('span.pn', '💬'), h('div', h('b', m.name || 'Someone'), ' ', m.text)));
    const input = h('input.input.grow', { placeholder: app.room ? 'Say something to the room' : 'Chat needs the live room', disabled: !app.room, maxlength: 240,
      onkeydown: e => { if (e.key === 'Enter' && e.target.value.trim()) { app.say(e.target.value.trim()); e.target.value = ''; } } });
    return h('div.card',
      h('div.feed', chat, items.length ? items : h('div.feed-item', h('span.pn'), h('span.dim', 'No picks yet.'))),
      h('div.chat-input', input, h('button.btn.sm.secondary', { disabled: !app.room, onclick: () => { if (input.value.trim()) { app.say(input.value.trim()); input.value = ''; } } }, 'Send'))
    );
  }

  /* ── layout ────────────────────────────────────────────────────────── */
  const paneEls = { players: h('div.pane'), board: h('div.pane'), team: h('div.pane'), feed: h('div.pane') };
  const painters = { players: playersPane, board: boardPane, team: teamPane, feed: feedPane };
  function repaint(which) { mount(paneEls[which], painters[which]()); }
  function showTab(tab) { ui.tab = tab; for (const k in paneEls) paneEls[k].classList.toggle('show', k === tab); tabbar.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab))); }
  const tabbar = h('nav.tabbar', ['players', 'board', 'team', 'feed'].map(t => h('button', { 'data-tab': t, role: 'tab', onclick: () => showTab(t) }, t === 'players' ? 'Players' : t === 'board' ? 'Board' : t === 'team' ? 'My team' : 'Feed')));
  const clockHost = h('div');
  const online = () => (app.peers || []).length ? h('span.tiny.dim', `${app.peers.length} online`) : null;

  mount(root,
    h('div.row', { style: { flexWrap: 'wrap', gap: '8px 12px' } },
      h('div.grow', h('h1', lg().name || 'Draft'), h('div.small.dim', `${lg().teams.length} war rooms · ${lg().mode === 'snake' && store.kind === 'local' ? 'practice' : 'live'}`)),
      online(),
      store.kind === 'local' && h('button.btn.sm.ghost', { onclick: () => { if (confirm('End this practice draft and see results with what you have?')) store.finish(); } }, 'End draft')
    ),
    h('div', { style: { marginTop: '12px' } }, clockHost),
    h('div.desk.three',
      h('div', paneEls.players),
      h('div', paneEls.board, h('div', { style: { height: '14px' } }), paneEls.feed),
      h('div', paneEls.team)
    ),
    tabbar
  );
  showTab(ui.tab);

  function full() {
    mount(clockHost, clockbar()); paintClock();
    for (const k in paneEls) repaint(k);
    if (store.isMyTurn && document.visibilityState === 'visible' && app.lastTurnPing !== lg().picks.length) { app.lastTurnPing = lg().picks.length; toast('You’re on the clock'); }
  }
  const unsub = store.subscribe(s => {
    const L = s.league; if (!L) return;
    if (L.status === 'done' || L.done) { unsub(); app.onDraftDone(); return; }
    const key = `${L.picks.length}|${s.meIdx}|${L.teams.length}|${app.peers?.length}|${ui.chat.length}`;
    if (key !== lastKey) { lastKey = key; full(); } else paintClock();
  });
  app.onChat = () => { const k = `${lg().picks.length}|${store.meIdx}|${lg().teams.length}|${app.peers?.length}|${ui.chat.length}`; if (k !== lastKey) { lastKey = k; repaint('feed'); } };
  return unsub;
}
