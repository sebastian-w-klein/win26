import { h, mount, toast } from './dom.js';
import { ENVIRONMENTS } from '../engine/scoring.js';
import { MAX_TEAMS, DEFAULT_CLOCK } from '../engine/draft.js';
import { ROLES } from '../data/roles.js';
import { LANES } from '../data/lanes.js';
import { OPERATIVES } from '../data/operatives.js';
import { createSharedLeague, watchLeagues, deleteLeague } from '../net/store.js';
import { remember } from '../net/identity.js';

const CLOCKS = [[0, 'No clock'], [45, '45s'], [90, '90s'], [180, '3 min'], [600, '10 min']];

export function renderLobby(root, app) {
  const me = app.me;
  const form = { name: '', teams: 8, env: 'tossup', clock: DEFAULT_CLOCK };
  const practice = { teams: 6, env: 'tossup', clock: 0 };
  let leagues = null, unsub = null;

  const nameInput = h('input.input', { value: me.name, placeholder: 'Your name', maxlength: 28,
    oninput: e => { app.me = remember({ name: e.target.value.trim() }); } });

  const envSeg = (obj, rerender) => h('div.seg', ENVIRONMENTS.map(e =>
    h('button', { 'aria-pressed': String(obj.env === e.id), title: e.sub, onclick: () => { obj.env = e.id; rerender(); } }, e.label)));
  const teamsSel = (obj, rerender) => h('select.input', { onchange: e => { obj.teams = +e.target.value; rerender(); } },
    [...Array(MAX_TEAMS - 1).keys()].map(i => h('option', { value: i + 2, selected: obj.teams === i + 2 }, `${i + 2} war rooms`)));
  const clockSel = (obj, rerender) => h('select.input', { onchange: e => { obj.clock = +e.target.value; rerender(); } },
    CLOCKS.map(([v, l]) => h('option', { value: v, selected: obj.clock === v }, l)));

  function leagueList() {
    if (!app.db) return h('div.card.pad.dim.small', 'Live leagues need the shared runtime — open this page from claude.ai to draft with coworkers. Practice drafts work anywhere.');
    if (leagues === null) return h('div.card.pad.dim.small', 'Loading leagues…');
    if (!leagues.length) return h('div.card.pad.dim.small', 'No leagues yet. Create one and send the link around.');
    return h('div.card', leagues.map(L => {
      const filled = L.seats.filter(Boolean).length, mine = L.seats.some(s => s && s.token === me.token);
      return h('div.league-row',
        h('div.grow',
          h('div.name', L.name, mine && h('span.chip.accent', { style: { marginLeft: '8px' } }, 'You’re in')),
          h('div.tiny.dim', `${filled}/${L.settings.teams} seats · ${ENVIRONMENTS.find(e => e.id === L.settings.env)?.label ?? ''} · ${L.settings.clock ? L.settings.clock + 's clock' : 'no clock'}`)),
        h('span.chip', { class: L.status === 'drafting' ? 'accent' : L.status === 'done' ? 'good' : '' }, L.status === 'lobby' ? 'Open' : L.status === 'drafting' ? 'Drafting' : 'Final'),
        L.owner === me.token && L.status !== 'drafting' && h('button.btn.sm.danger', { onclick: async () => { if (confirm(`Delete "${L.name}"?`)) await deleteLeague(app.db, L.id); } }, 'Delete'),
        h('button.btn.sm.secondary', { onclick: () => app.go(`league/${L.id}`) }, L.status === 'done' ? 'Results' : 'Open')
      );
    }));
  }

  function render() {
    mount(root,
      h('div.hero',
        h('h1', 'War Room ', h('span', 'Draft'), ' 2028'),
        h('p', `Fantasy football for the people who run presidential campaigns. Draft an ideological lane and ${ROLES.length} real operatives, then run the whole roster through every county in the country.`)
      ),
      h('div.section',
        h('div.field', h('span.label', 'You'), nameInput)
      ),
      h('div.desk',
        h('div',
          h('div.section-title', h('h2', 'Live leagues'), h('span.dim.small', 'Draft with coworkers on one link')),
          leagueList(),
          app.db && h('div.card.pad', { style: { marginTop: '10px' } },
            h('div.stack',
              h('div.field', h('span.label', 'League name'), h('input.input', { value: form.name, placeholder: 'e.g. Fourth Floor Invitational', maxlength: 40, oninput: e => { form.name = e.target.value; } })),
              h('div.row', { style: { flexWrap: 'wrap' } }, h('div.field.grow', h('span.label', 'Seats'), teamsSel(form, render)), h('div.field.grow', h('span.label', 'Pick clock'), clockSel(form, render))),
              h('div.field', h('span.label', 'National environment'), envSeg(form, render)),
              h('button.btn', { onclick: async () => {
                if (!app.me.name) return toast('Add your name first', 'bad');
                const name = form.name.trim() || `${app.me.name}’s league`;
                try { const id = await createSharedLeague(app.db, app.me, { ...form, name }); app.go(`league/${id}`); }
                catch (e) { toast(e.message || 'Could not create the league', 'bad'); }
              } }, 'Create league')
            )
          )
        ),
        h('div',
          h('div.section-title', h('h2', 'Practice draft'), h('span.dim.small', 'You against bots, right now')),
          h('div.card.pad', h('div.stack',
            h('div.row', { style: { flexWrap: 'wrap' } }, h('div.field.grow', h('span.label', 'War rooms'), teamsSel(practice, render)), h('div.field.grow', h('span.label', 'Pick clock'), clockSel(practice, render))),
            h('div.field', h('span.label', 'National environment'), envSeg(practice, render)),
            h('button.btn.secondary', { onclick: () => app.startPractice(practice) }, 'Start practice draft')
          )),
          h('div.section',
            h('div.section-title', h('h2', 'How it works')),
            h('div.card.pad.stack.small.dim',
              h('p', h('b', { style: { color: 'var(--ink)' } }, 'Round 1 is your lane. '), `${LANES.length} ideological lanes, six per side, exclusive: one war room per lane.`),
              h('p', h('b', { style: { color: 'var(--ink)' } }, 'Then 21 rounds, any open slot. '), `${OPERATIVES.filter(o => !o.free).length} real operatives, strategists and firms. Every pick is multiplied by how well it fits the lane you chose — cross-party hires cost you 38%.`),
              h('p', h('b', { style: { color: 'var(--ink)' } }, 'Then election night. '), 'Every roster is run through all 3,142 counties. The map shows which war room is most likely to win each one.')
            )
          )
        )
      ),
      h('p.disclaimer', 'Everyone in the pool is a real, public political professional, firm or organization; the credit line on every card is public record. The ratings are not: OVR, cost and the spec tags are invented gameplay numbers, balanced so the draft plays well, and are not an assessment of anyone’s actual ability.')
    );
  }

  if (app.db) unsub = watchLeagues(app.db, list => { leagues = list; render(); });
  render();
  return () => unsub?.();
}
