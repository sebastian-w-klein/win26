import { h, mount, fmt } from './dom.js';
import { ROLES, CATEGORIES } from '../data/roles.js';
import { AXES } from '../data/lanes.js';
import { EV_TO_WIN, FLOORS } from '../data/map.js';
import { scoreDraft, gradeFor, headToHead, rateRoster, ENVIRONMENTS } from '../engine/scoring.js';
import { standings, encodeRoster, leagueOpponent } from '../engine/draft.js';

const AXIS_LABEL = {
  union: 'Union HH', college: 'College', latino: 'Latino',
  black: 'Black', rural: 'Rural', young: 'Under 30', senior: 'Seniors'
};

const joinNames = names =>
  names.length <= 1 ? (names[0] ?? '')
  : names.length === 2 ? names.join(' and ')
  : names.slice(0, -1).join(', ') + ' and ' + names.at(-1);

function marginCell(m) {
  const tone = m > 2 ? 'var(--good)' : m > 0 ? '#9ad9c8' : m > -2 ? '#e08a7a' : 'var(--bad)';
  return h('td.num', { style: { color: tone, fontWeight: 700 } }, fmt(m));
}

function mapTable(results, side) {
  return h('div.scroll-x', h('table.map',
    h('thead', h('tr',
      h('th', 'State'), h('th.num', 'EV'), h('th.num', 'Cook PVI'),
      h('th.num', 'Margin'), h('th.num', 'Coalition'), h('th.num', 'Operation'), h('th', '')
    )),
    h('tbody', [...results].sort((a, b) => b.margin - a.margin).map(r =>
      h('tr', { class: r.won ? 'win' : 'loss' },
        h('td', h('b', r.state.name), h('div.tiny.faint', r.state.note)),
        h('td.num', r.state.ev),
        h('td.num.faint', (r.state.pvi > 0 ? 'R+' : r.state.pvi < 0 ? 'D+' : 'EVEN') + (r.state.pvi ? Math.abs(r.state.pvi) : '')),
        marginCell(r.margin),
        h('td.num.dim', fmt(r.coalition)),
        h('td.num.dim', fmt(r.ops)),
        h('td', r.recount ? h('span.chip.warn', 'Recount') : r.won ? h('span.chip.good', 'Won') : '')
      )
    ))
  ));
}

function unitBars(units) {
  return h('div.bars', Object.entries(units)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, v]) => h('div.bar-row', { style: { '--cat': CATEGORIES[cat].color } },
      h('div.lbl', CATEGORIES[cat].label),
      h('div.track', h('i', { style: { width: Math.max(2, Math.min(100, (v - 50) / 50 * 100)) + '%' } })),
      h('div.val', v.toFixed(0))
    )));
}

function coalitionBars(rating) {
  return h('div.bars', AXES.map(a => {
    const v = rating.appeal[a];
    const w = Math.min(50, Math.abs(v) / 3 * 50);
    return h('div.bar-row',
      h('div.lbl', AXIS_LABEL[a]),
      h('div.axis-bar', { style: { height: '9px' } }, h('i', {
        style: {
          left: v >= 0 ? '50%' : `${50 - w}%`, width: `${w}%`,
          background: v >= 0 ? 'var(--good)' : 'var(--bad)'
        }
      })),
      h('div.val', fmt(v))
    );
  }));
}

export function renderResults(root, state, restart) {
  const league = state.league;
  const you = league.teams[0];
  const envName = ENVIRONMENTS.find(e => e.id === league.env);
  const opponent = league.mode === 'snake' ? leagueOpponent(league) : undefined;
  const res = scoreDraft(you.roster, you.lane, league.envPoints, opponent);
  const grade = gradeFor(res.score);
  const code = encodeRoster(you.lane, you.roster, league.env);
  const board = league.mode === 'snake' ? standings(league) : [];

  // Head-to-head only exists against the other side.
  const rated = league.teams.filter(t => t.lane).map(t => ({ ...t, rating: rateRoster(t.roster, t.lane) }));
  const me = rated[0];
  const rivals = rated.slice(1).filter(t => t.lane.side !== you.lane.side);
  const matchups = rivals.map(r => ({ rival: r, h2h: headToHead(me, r, league.envPoints) }));
  const sameSideRivals = rated.slice(1).filter(t => t.lane.side === you.lane.side);

  mount(root,
    h('header.mast',
      h('div',
        h('h1', res.won ? 'You win the presidency' : 'You come up short'),
        h('div.sub', `${you.lane.name} · ${envName?.label ?? 'Toss-up'} · ${you.name}`)
      ),
      h('div.right', h('b', `${res.ev} EV`), `${EV_TO_WIN} to win`)
    ),
    h('div.wrap',
      h('div.verdict',
        h('div.stat',
          h('div.k', 'Electoral votes'),
          h('div.v', { style: { color: res.won ? 'var(--lime)' : 'var(--bad)' } }, res.ev),
          h('div.n', `${FLOORS[you.lane.side]} safe + ${res.ev - FLOORS[you.lane.side]} won`)),
        h('div.stat',
          h('div.k', 'Draft score'),
          h('div.v', res.score),
          h('div.n', `Grade ${grade[1]} — ${grade[2]}`)),
        h('div.stat',
          h('div.k', 'Tipping point'),
          h('div.v', res.tipping ? fmt(res.tipping.margin) : '—'),
          h('div.n', res.tipping ? `${res.tipping.state.name} delivers 270` : 'Never reaches 270')),
        h('div.stat',
          h('div.k', 'Floor / ceiling'),
          h('div.v', { style: { fontSize: '22px' } }, `${res.floor.ev}–${res.ceiling.ev}`),
          h('div.n', `Volatility ${you.lane.volatility.toFixed(1)}`)),
        h('div.stat',
          h('div.k', 'Roster fit'),
          h('div.v', `${res.rating.onLane}/${ROLES.length}`),
          h('div.n', res.rating.crossParty ? `${res.rating.crossParty} cross-party ${res.rating.crossParty === 1 ? 'hire' : 'hires'}` : 'No cross-party hires'))
      ),

      h('div.section-label', 'Election night'),
      h('p.note',
        league.mode === 'snake' && opponent
          ? `Run against this league's average operation (rating ${opponent.toFixed(0)}). Margins are in points.`
          : 'Run against a generic well-run opposing campaign. Margins are in points.'),
      h('div', { style: { marginTop: '12px' } }, mapTable(res.results, you.lane.side)),

      matchups.length > 0 && h('div', null,
        h('div.section-label', 'Head to head'),
        h('p.note', 'Against the war rooms that drafted out of the same pool. Here only one of you can win.'),
        h('div.scroll-x', { style: { marginTop: '12px' } }, h('table.map',
          h('thead', h('tr', h('th', 'Opponent'), h('th', 'Lane'), h('th.num', 'Result'), h('th', ''))),
          h('tbody', matchups.map(({ rival, h2h }) =>
            h('tr', { class: h2h.aWon ? 'win' : 'loss' },
              h('td', h('b', rival.name)),
              h('td.dim', rival.lane.name),
              h('td.num', `${h2h.evA}–${h2h.evB}`),
              h('td', h2h.aWon ? h('span.chip.good', 'You win') : h('span.chip.bad', 'You lose'))
            )))
        ))
      ),

      sameSideRivals.length > 0 && h('p.note', { style: { marginTop: '14px' } },
        `${joinNames(sameSideRivals.map(t => t.name))} drafted on your side of the aisle — `,
        `you never face ${sameSideRivals.length === 1 ? 'them' : 'any of them'} in a general `,
        'election, so compare on draft score instead.'),

      h('div.section-label', 'Unit ratings'),
      h('div.board-layout',
        h('div', unitBars(res.rating.units)),
        h('div',
          h('div.tiny.dim', { style: { marginBottom: '8px' } },
            'Coalition profile — how your lane and your specialist hires land with each group, ',
            'against a generic nominee of your own party.'),
          coalitionBars(res.rating))
      ),

      board.length > 1 && h('div', null,
        h('div.section-label', 'League standings'),
        h('div.scroll-x', h('table.map',
          h('thead', h('tr', h('th', '#'), h('th', 'War room'), h('th', 'Lane'), h('th.num', 'EV'), h('th.num', 'Score'), h('th', 'Grade'))),
          h('tbody', board.map((s, i) =>
            h('tr', { class: s.team.human ? 'win' : '' },
              h('td.num', i + 1),
              h('td', h('b', s.team.name), s.team.human && h('span.chip.lime', { style: { marginLeft: '6px' } }, 'You')),
              h('td.dim', s.team.lane.name),
              h('td.num', s.result.ev),
              h('td.num', h('b', s.result.score)),
              h('td', h('span.chip.ghost', gradeFor(s.result.score)[1]))
            )))
        ))
      ),

      h('div.section-label', 'Your roster'),
      h('div.slot-grid', ROLES.map(r => {
        const pick = you.roster[r.id];
        const slot = res.rating.slots.find(s => s.role.id === r.id);
        return h('div.slot', { style: { '--cat': CATEGORIES[r.cat].color } },
          h('div.num', r.n),
          h('div.cat', CATEGORIES[r.cat].label),
          h('div.title', r.title),
          h('div.pick',
            pick ? h('div.name', pick.name) : h('div.name.faint', 'Unfilled'),
            pick && h('div.org', pick.org),
            pick && h('div', { style: { marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' } },
              h('span', { class: `chip ${slot.fit.tone === 'good' ? 'good' : slot.fit.tone === 'bad' ? 'bad' : slot.fit.tone === 'warn' ? 'warn' : 'ghost'}` }, slot.fit.label),
              h('span.chip.ghost', `OVR ${pick.ovr}`))
          )
        );
      })),

      h('div.section-label', 'Share your draft'),
      h('div.share',
        h('code', code),
        h('button.btn.sm', {
          onclick: e => {
            navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${code}`)
              .then(() => { e.target.textContent = 'Copied'; setTimeout(() => (e.target.textContent = 'Copy link'), 1600); })
              .catch(() => { e.target.textContent = 'Copy failed'; });
          }
        }, 'Copy link'),
        h('button.btn.sm.ghost', { onclick: restart }, 'New draft')
      ),
      h('p.tiny.faint', { style: { marginTop: '10px' } },
        'Anyone opening that link sees this exact roster scored the same way.'),

      h('p.disclaimer',
        'Ratings, costs and spec tags are invented for gameplay and are not an assessment of ',
        'any real person, firm or organization. Cook PVI values are the 2025 vintage, rounded ',
        'as published; the simulation carries a decimal refinement so states do not flip in ',
        'lockstep. Everything else here is a model, not a forecast.')
    )
  );
}
