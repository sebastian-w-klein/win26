/** The league lobby: seats, settings, presence, and the start button. */
import { h, mount, toast } from './dom.js';
import { ENVIRONMENTS } from '../engine/scoring.js';
import { MAX_TEAMS } from '../engine/draft.js';

export function renderRoom(root, app, store) {
  const doc = store.doc;
  const me = app.me;
  const online = new Set((app.peers || []).map(p => p.presence?.token).filter(Boolean));
  const link = `${location.origin}${location.pathname}#league/${store.id}`;

  const seatBtn = (seat, i) => {
    const mine = seat && seat.token === me.token;
    return h('button.seat', { class: `${seat ? 'taken' : ''} ${mine ? 'me' : ''}`, disabled: doc.status !== 'lobby' || (seat && !mine),
      onclick: async () => {
        if (mine) return store.leave();
        if (!me.name) return toast('Add your name on the home screen first', 'bad');
        try { await store.join(i, me.name); } catch (e) { toast(e.message, 'bad'); }
      } },
      h('span.n', `Seat ${i + 1}`),
      h('span.who', seat ? seat.name : 'Open'),
      seat && h('span.tiny', { class: online.has(seat.token) || mine ? 'good' : 'faint' }, mine ? 'You · tap to leave' : online.has(seat.token) ? '● online' : 'joined'),
      !seat && doc.status === 'lobby' && h('span.tiny.dim', 'Tap to take this seat')
    );
  };

  mount(root,
    h('div.row', { style: { flexWrap: 'wrap', gap: '12px' } },
      h('div.grow', h('h1', doc.name), h('div.dim.small', `${doc.seats.filter(Boolean).length} of ${doc.settings.teams} seats taken · ${ENVIRONMENTS.find(e => e.id === doc.settings.env)?.label} · ${doc.settings.clock ? doc.settings.clock + 's pick clock' : 'no pick clock'}`)),
      h('button.btn.sm.secondary', { onclick: () => navigator.clipboard?.writeText(link).then(() => toast('Link copied')) }, 'Copy invite link')
    ),
    h('div.section',
      h('div.section-title', h('h2', 'Seats'), h('span.dim.small', 'Empty seats become bots when the draft starts')),
      h('div.seat-grid', doc.seats.map(seatBtn))
    ),
    store.isOwner && doc.status === 'lobby' && h('div.section',
      h('div.section-title', h('h2', 'Commissioner')),
      h('div.card.pad.stack',
        h('div.row', { style: { flexWrap: 'wrap' } },
          h('div.field.grow', h('span.label', 'Seats'),
            h('select.input', { onchange: e => store.updateSettings({ teams: +e.target.value }) },
              [...Array(MAX_TEAMS - 1).keys()].map(i => h('option', { value: i + 2, selected: doc.settings.teams === i + 2 }, `${i + 2}`)))),
          h('div.field.grow', h('span.label', 'Pick clock'),
            h('select.input', { onchange: e => store.updateSettings({ clock: +e.target.value }) },
              [[0, 'No clock'], [45, '45s'], [90, '90s'], [180, '3 min'], [600, '10 min']].map(([v, l]) => h('option', { value: v, selected: doc.settings.clock === v }, l))))
        ),
        h('div.field', h('span.label', 'National environment'),
          h('div.seg', ENVIRONMENTS.map(e => h('button', { 'aria-pressed': String(doc.settings.env === e.id), title: e.sub, onclick: () => store.updateSettings({ env: e.id }) }, e.label)))),
        h('button.btn.block', { onclick: async () => { try { await store.start(); } catch (e) { toast(e.message, 'bad'); } } },
          `Start the draft${store.seatsOpen ? ` (${store.seatsOpen} bot${store.seatsOpen === 1 ? '' : 's'})` : ''}`)
      )
    ),
    !store.isOwner && doc.status === 'lobby' && h('p.dim.small', { style: { marginTop: '18px' } }, store.meIdx >= 0 ? 'You’re in. Waiting for the commissioner to start the draft.' : 'Take a seat to join.'),
    h('div.section', h('button.btn.ghost.sm', { onclick: () => app.go('') }, '← All leagues'))
  );
}
