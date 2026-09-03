/** Election night: the map, the states, head-to-head, standings, and your roster. */
import { h, mount, fmt, toast } from './dom.js';
import { ROLES, CATEGORIES } from '../data/roles.js';
import { SIDE } from '../data/lanes.js';
import { EV_TO_WIN } from '../data/states.js';
import { BATTLEGROUNDS } from '../data/battlegrounds.js';
import { scoreDraft, gradeFor, headToHead, simulate, prepare, ENVIRONMENTS, laneFit } from '../engine/scoring.js';
import { leagueOpponent, encodeRoster } from '../engine/draft.js';
import { renderMap, buildMapModel, assignColors } from './map.js';
import { ratingOf, houseRead } from './pollster.js';

export function renderResults(root, app, league, meIdx = 0) {
  const teams = league.teams.filter(t => t.lane).map(t => prepare(t));
  const me = teams.find(t => t.idx === meIdx) || teams[0];
  const env = league.envPoints;
  const opponent = league.mode === 'snake' && teams.length > 1 ? leagueOpponent(league) : undefined;
  const envMeta = ENVIRONMENTS.find(e => e.id === league.env);

  const results = teams.map(t => ({ team: t, result: scoreDraft(t, { env, opponent }) })).sort((a, b) => b.result.score - a.result.score);
  const mine = results.find(r => r.team.idx === me.idx).result;
  const grade = gradeFor(mine.score);

  // Map: every war room's county win probabilities. A lone roster gets a synthetic opponent.
  const colors = assignColors(teams);
  let entries = teams.map((t, i) => ({ team: t, color: colors[i], sim: results.find(r => r.team.idx === t.idx).result }));
  if (entries.length === 1) {
    const flip = sim => ({ counties: sim.counties.map(r => ({ c: r.c, margin: -r.margin })), states: sim.states.map(s => ({ st: s.st, margin: -s.margin })) });
    entries = [entries[0], { team: { name: 'Generic opposition', idx: -1, lane: { side: me.lane.side === 'D' ? 'R' : 'D' } }, color: me.lane.side === 'D' ? '#ef4444' : '#3b82f6', sim: flip(entries[0].sim) }];
  }
  const model = buildMapModel(entries);
  const mapHost = h('div');

  const rivals = teams.filter(t => t.idx !== me.idx && t.lane.side !== me.lane.side);
  const h2h = rivals.map(r => ({ rival: r, m: headToHead(me, r, env) }));

  const stateRows = [...mine.states].sort((a, b) => b.margin - a.margin);
  let showAll = false;
  const stateTable = () => {
    const rows = showAll ? stateRows : stateRows.filter(s => BATTLEGROUNDS[s.st.abbr] || Math.abs(s.margin) < 6);
    return h('div.scroll-x', h('table.tbl',
      h('thead', h('tr', h('th', 'State'), h('th.num', 'EV'), h('th.num', 'Lean'),
        h('th.num', { title: 'How far this state\u2019s counties have moved from cycle to cycle since 2012, with 1.00 as the national average. Coalition and Operation are both multiplied by it.' }, 'Elastic'),
        h('th.num', 'Margin'), h('th.num', 'Win %'), h('th.num', 'Coalition'), h('th.num', 'Operation'), h('th', ''))),
      h('tbody', rows.map(s => h('tr',
        h('td', h('b', s.st.name), BATTLEGROUNDS[s.st.abbr] && h('div.tiny.faint', BATTLEGROUNDS[s.st.abbr].note)),
        h('td.num', s.st.ev),
        h('td.num.dim', (s.st.lean >= 0 ? 'D+' : 'R+') + Math.abs(s.st.lean).toFixed(1)),
        h('td.num.dim', s.st.elasticity.toFixed(2) + '\u00d7'),
        h('td.num', { style: { color: s.margin > 2 ? 'var(--good)' : s.margin > 0 ? '#86efac' : s.margin > -2 ? '#fca5a5' : 'var(--bad)', fontWeight: 700 } }, fmt(s.margin)),
        h('td.num', (s.p * 100).toFixed(0) + '%'),
        h('td.num.dim', fmt(s.coalition)), h('td.num.dim', fmt(s.ops)),
        h('td', s.recount ? h('span.chip.warn', 'Recount') : s.won ? h('span.chip.good', 'Won') : '')
      )))
    ));
  };
  const stateHost = h('div');
  const paintStates = () => mount(stateHost, stateTable(), h('button.btn.sm.ghost', { style: { marginTop: '8px' }, onclick: () => { showAll = !showAll; paintStates(); } }, showAll ? 'Show battlegrounds only' : 'Show all 51'));
  paintStates();

  const code = encodeRoster(me.lane, me.roster, league.env);
  const link = `${location.origin}${location.pathname}#roster/${code}`;

  mount(root,
    h('div.row', { style: { flexWrap: 'wrap', gap: '8px 12px' } },
      h('div.grow', h('h1', mine.won ? `${me.name} wins the presidency` : `${me.name} comes up short`), h('div.small.dim', `${me.lane.name} · ${envMeta?.label ?? 'Toss-up'} (${envMeta?.sub ?? ''}) · ${league.name || 'Draft'}`)),
      h('button.btn.sm.ghost', { onclick: () => app.go('') }, '← Home')
    ),
    h('div.stats', { style: { marginTop: '14px' } },
      h('div.card.stat', h('div.label', 'Electoral votes'), h('div.v', { style: { color: mine.won ? 'var(--good)' : 'var(--bad)' } }, mine.ev), h('div.n', `${EV_TO_WIN} to win · ${mine.expectedEv.toFixed(0)} expected`)),
      h('div.card.stat', h('div.label', 'Draft score'), h('div.v', mine.score), h('div.n', `Grade ${grade[1]} — ${grade[2]}`)),
      h('div.card.stat', h('div.label', 'Tipping point'), h('div.v', mine.tipping ? fmt(mine.tipping.margin) : '—'), h('div.n', mine.tipping ? `${mine.tipping.st.name} delivers 270` : 'Never reaches 270')),
      h('div.card.stat', h('div.label', 'Floor / ceiling'), h('div.v', { style: { fontSize: '24px' } }, `${mine.floor.ev}–${mine.ceiling.ev}`), h('div.n', `Volatility ${me.lane.volatility.toFixed(1)}`)),
      h('div.card.stat', h('div.label', 'Roster fit'), h('div.v', `${mine.rating.onLane}/${ROLES.length}`), h('div.n', `${mine.rating.crossParty} cross-party · ${mine.rating.freeAgents} free agent${mine.rating.freeAgents === 1 ? '' : 's'}`))
    ),

    h('div.section',
      h('div.section-title', h('h2', 'The map'), h('span.dim.small', entries.length > 2 ? 'Each county shaded for the war room that runs strongest there. Hover for every room’s share; search any county; switch to states.' : 'Shaded by how you run in each county against a generic opposing campaign.')),
      mapHost
    ),

    (() => {
      const poll = me.roster['chief-pollster'], r = ratingOf(poll), read = r && houseRead(r, me.lane.side);
      return read && Math.abs(read.pts) >= 0.05 && h('div.section',
        h('div.card.pad',
          h('div.row', { style: { flexWrap: 'wrap', gap: '10px' } },
            h('div.grow', h('div.label', 'Your pollster'),
              h('div', { style: { fontWeight: 700, marginTop: '2px' } }, poll.name, ' · SB ', r.grade, ' · house ', (r.bias > 0 ? 'D+' : 'R+') + Math.abs(r.bias).toFixed(1)),
              h('p.small.dim', { style: { marginTop: '4px' } }, read.why)),
            h('div', { style: { textAlign: 'right' } }, h('div.label', 'Worth'),
              h('div', { class: read.tone === 'good' ? 'good-text' : 'bad-text', style: { fontFamily: 'var(--display)', fontWeight: 800, fontSize: '26px', color: read.tone === 'good' ? 'var(--good)' : 'var(--bad)' } },
                (read.pts > 0 ? '+' : '') + read.pts.toFixed(2)), h('div.tiny.dim', 'points, everywhere')))));
    })(),

    h('div.section',
      h('div.section-title', h('h2', 'Election night'), h('span.dim.small', opponent ? `Run against this league’s average operation (rating ${opponent.toFixed(0)}). Margins in points.` : 'Run against a generic well-run opposing campaign. Margins in points.')),
      stateHost
    ),

    h2h.length > 0 && h('div.section',
      h('div.section-title', h('h2', 'Head to head'), h('span.dim.small', 'Against the war rooms on the other side. Only one of you can win each of these.')),
      h('div.scroll-x', h('table.tbl',
        h('thead', h('tr', h('th', 'Opponent'), h('th', 'Lane'), h('th.num', 'Result'), h('th', 'Tipping point'), h('th', ''))),
        h('tbody', h2h.map(({ rival, m }) => h('tr',
          h('td', h('b', rival.name)), h('td.dim', rival.lane.name), h('td.num', `${m.ev}–${m.evOpp}`),
          h('td.dim.small', m.tipping ? `${m.tipping.st.name} ${fmt(m.tipping.margin)}` : '—'),
          h('td', m.won ? h('span.chip.good', 'You win') : h('span.chip.bad', 'You lose'))
        )))
      ))
    ),

    results.length > 1 && h('div.section',
      h('div.section-title', h('h2', 'Standings')),
      h('div.scroll-x', h('table.tbl',
        h('thead', h('tr', h('th', '#'), h('th', 'War room'), h('th', 'Lane'), h('th.num', 'EV'), h('th.num', 'Expected'), h('th.num', 'Score'), h('th', 'Grade'))),
        h('tbody', results.map((r, i) => h('tr', { class: r.team.idx === me.idx ? 'me' : '' },
          h('td.num', i + 1), h('td', h('b', r.team.name)), h('td.dim', r.team.lane.name),
          h('td.num', r.result.ev), h('td.num.dim', r.result.expectedEv.toFixed(0)), h('td.num', h('b', r.result.score)), h('td', h('span.chip', gradeFor(r.result.score)[1]))
        )))
      ))
    ),

    h('div.section',
      h('div.section-title', h('h2', 'Your roster')),
      h('div.roster', ROLES.map(r => {
        const p = me.roster[r.id]; const fit = p ? laneFit(p, me.lane) : null;
        return h('div.slotrow', { class: p ? '' : 'empty', style: { '--cat': CATEGORIES[r.cat].color } },
          h('span.n', r.n), h('div', h('div.role', r.title), h('div.who', p ? p.name : '—'), p && h('div.tiny.faint', p.credit)),
          p && h('div.row', h('span.chip', { class: fit.tone === 'good' ? 'good' : fit.tone === 'bad' ? 'bad' : fit.tone === 'warn' ? 'warn' : '' }, fit.label), h('span.chip', `OVR ${p.ovr}`)));
      }))
    ),

    h('div.section',
      h('div.section-title', h('h2', 'Share')),
      h('div.row.share', { style: { flexWrap: 'wrap' } }, h('code', code),
        h('button.btn.sm', { onclick: e => navigator.clipboard?.writeText(link).then(() => toast('Link copied')).catch(() => toast('Copy failed', 'bad')) }, 'Copy roster link')),
      h('p.tiny.faint', { style: { marginTop: '8px' } }, 'Anyone opening that link sees this roster scored against a generic opponent, no league needed.')
    ),
    h('p.disclaimer', 'Ratings, costs and spec tags are invented for gameplay and are not an assessment of any real person, firm or organization. County leans are the average of the 2020 and 2024 presidential results relative to the national vote; demographics are Census figures via MIT Election Lab. Everything else is a model, not a forecast.')
  );
  renderMap(mapHost, model, { meIdx: entries.findIndex(e => e.team.idx === me.idx) });
}
