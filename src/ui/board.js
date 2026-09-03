import { h, mount } from './dom.js';
import { ROLES, CATEGORIES } from '../data/roles.js';
import { laneFit } from '../engine/scoring.js';
import {
  onClock, currentRole, availableFor, availableLanes, pickLane, pickOperative,
  runBots, picksUntilNextTurn, SOLO_CAP
} from '../engine/draft.js';
import { laneCard } from './setup.js';

const FORM_CHIP = { W: ['good', 'Won'], L: ['bad', 'Lost'], N: ['ghost', '—'] };

function opRow(op, lane, { onPick, disabled, note } = {}) {
  const fit = lane ? laneFit(op, lane) : null;
  const [formTone, formWord] = FORM_CHIP[op.form ?? 'N'];
  return h('button.op', { disabled, onclick: () => onPick?.(op) },
    h('div',
      h('div.name', op.name),
      h('div.org', op.org)
    ),
    h('div',
      h('div.ovr', { style: { color: op.ovr >= 88 ? 'var(--lime)' : op.ovr >= 80 ? 'var(--ink)' : 'var(--ink-dim)' } }, op.ovr),
      h('div.cost', `${op.cost} cr`)
    ),
    h('div.credit', op.credit),
    h('div.badges',
      fit && h('span', { class: `chip ${fit.tone === 'good' ? 'good' : fit.tone === 'bad' ? 'bad' : fit.tone === 'warn' ? 'warn' : 'ghost'}` }, fit.label),
      h('span', { class: `chip ${formTone}` }, op.form === 'N' ? op.formCycle : `${formWord} · ${op.formCycle}`),
      ...op.specs.map(s => h('span.chip.ghost', s)),
      note && h('span.chip.warn', note)
    )
  );
}

function slotCard(role, pick, { active, onClick, lane } = {}) {
  const color = CATEGORIES[role.cat].color;
  const fit = pick && lane ? laneFit(pick, lane) : null;
  return h('button.slot', {
    class: active ? 'active' : '', style: { '--cat': color },
    onclick: onClick, 'aria-label': `${role.title}${pick ? `, ${pick.name}` : ', empty'}`
  },
    h('div.num', role.n),
    h('div.cat', CATEGORIES[role.cat].label),
    h('div.title', role.title),
    pick
      ? h('div.pick',
          h('div.name', pick.name),
          h('div.org', pick.org),
          fit && fit.tone !== 'good' && h('span', { class: `chip ${fit.tone === 'bad' ? 'bad' : 'warn'}`, style: { marginTop: '4px' } }, fit.label)
        )
      : h('div.pick.empty', 'Your pick')
  );
}

export function renderBoard(root, state, onDone) {
  const league = state.league;
  const you = league.teams[0];
  const rerender = () => renderBoard(root, state, onDone);

  // Let the bots take their turns before the human sees the board.
  if (league.mode === 'snake') {
    runBots(league, (team, res, round) => {
      state.feed.unshift(round === 0
        ? `${team.name} takes the ${res.name} lane`
        : `${team.name} — ${res.name}`);
    });
  }

  if (league.done) return onDone();

  const clock = onClock(league);
  const role = currentRole(league);
  const spent = Object.values(you.roster).filter(Boolean).reduce((s, p) => s + p.cost, 0);
  const filled = Object.values(you.roster).filter(Boolean).length;
  const remaining = ROLES.length - filled;

  /* ── lane round ─────────────────────────────────────────────────────── */
  if (league.round === 0) {
    const open = availableLanes(league);
    const openIds = new Set(open.map(l => l.id));
    return mount(root,
      h('header.mast',
        h('div',
          h('h1', 'Round 0 · Pick your lane'),
          h('div.sub', 'Exclusive — one war room per lane')
        ),
        h('div.right', h('b', you.name), league.mode === 'snake' ? `${league.teams.length} war rooms` : 'Solo build')
      ),
      h('div.wrap',
        h('p.lede',
          'Before a single hire, decide what campaign you are running. Your lane sets your ',
          'national ceiling, decides which voters you over- and under-perform with in every ',
          'battleground, and determines which operatives are ', h('strong', 'on lane'),
          ' — hired into the campaign they actually believe in.'
        ),
        h('div.section-label', 'The lanes'),
        h('div.lane-grid', state.allLanes.map(lane =>
          laneCard(lane, {
            disabled: !openIds.has(lane.id),
            onPick: l => { pickLane(league, you, l.id); state.feed.unshift(`You take the ${l.name} lane`); rerender(); }
          })
        )),
        state.feed.length > 0 && h('div', null,
          h('div.section-label', 'Draft feed'),
          h('div.ticker', state.feed.slice(0, 12).map(t => h('div', t)))
        )
      )
    );
  }

  /* ── role rounds ────────────────────────────────────────────────────── */
  const soloRole = state.soloRole ? ROLES.find(r => r.id === state.soloRole) : null;
  const activeRole = league.mode === 'solo' ? (soloRole || role) : role;
  const pool = availableFor(league, activeRole.id);
  const waiting = league.mode === 'snake' && clock && !clock.human;
  const capLeft = SOLO_CAP - spent;

  const canAfford = op => league.mode !== 'solo'
    || you.roster[activeRole.id]?.id === op.id
    || (spent - (you.roster[activeRole.id]?.cost || 0) + op.cost) <= SOLO_CAP;

  mount(root,
    h('header.mast',
      h('div',
        h('h1', league.mode === 'solo' ? 'Build your war room' : `Round ${league.round} · ${activeRole.title}`),
        h('div.sub', `${you.lane.name} · ${filled} of ${ROLES.length} slots filled`)
      ),
      h('div.right',
        league.mode === 'solo'
          ? [h('b', `${capLeft} cr left`), `${SOLO_CAP} cap`]
          : [h('b', clock?.name ?? '—'), 'on the clock']
      )
    ),
    h('div.wrap',
      league.mode === 'solo' && h('div', { style: { marginTop: '14px' } },
        h('div', { class: `capbar ${spent > SOLO_CAP ? 'over' : ''}` },
          h('i', { style: { width: Math.min(100, spent / SOLO_CAP * 100) + '%' } })),
        h('div.tiny.dim', { style: { marginTop: '5px' } },
          `${spent} of ${SOLO_CAP} credits spent · ${remaining} slot${remaining === 1 ? '' : 's'} still empty`)
      ),

      h('div.board-layout', { style: { marginTop: '20px' } },
        h('div',
          h('div.section-label', 'Your board'),
          h('div.slot-grid', ROLES.map(r =>
            slotCard(r, you.roster[r.id], {
              lane: you.lane,
              active: r.id === activeRole.id,
              onClick: () => {
                if (league.mode === 'solo') { state.soloRole = r.id; rerender(); }
              }
            })
          )),
          league.mode === 'solo' && h('div', { style: { marginTop: '22px' } },
            h('button.btn', {
              disabled: filled < ROLES.length || spent > SOLO_CAP,
              onclick: () => { league.done = true; onDone(); }
            }, filled < ROLES.length ? `${remaining} slot${remaining === 1 ? '' : 's'} left` : 'Run the map'),
            spent > SOLO_CAP && h('span.chip.bad', { style: { marginLeft: '10px' } }, 'Over cap')
          )
        ),

        h('div',
          h('div.panel',
            h('div.head',
              h('h3', activeRole.title),
              h('div.tiny.dim', { style: { marginTop: '3px' } },
                league.mode === 'snake'
                  ? `${pool.length} still on the board · your next pick in ${picksUntilNextTurn(league, 0) === Infinity ? '—' : picksUntilNextTurn(league, 0)}`
                  : `${pool.length} available · slot weight ${activeRole.weight.toFixed(1)}`
              )
            ),
            h('div.body', pool.length
              ? pool.map(op => opRow(op, you.lane, {
                  disabled: waiting || !canAfford(op),
                  note: !canAfford(op) ? 'Over cap' : null,
                  onPick: o => {
                    if (league.mode === 'solo') {
                      you.roster[activeRole.id] = o;
                      const next = ROLES.find(r => !you.roster[r.id]);
                      state.soloRole = next ? next.id : activeRole.id;
                    } else {
                      pickOperative(league, you, o.id);
                      state.feed.unshift(`You take ${o.name} — ${activeRole.title}`);
                    }
                    rerender();
                  }
                }))
              : h('div', { style: { padding: '18px' } }, h('span.dim', 'Board is empty for this slot.'))
            )
          ),
          state.feed.length > 0 && h('div', { style: { marginTop: '16px' } },
            h('div.section-label', 'Draft feed'),
            h('div.ticker', state.feed.slice(0, 14).map(t => h('div', t)))
          )
        )
      )
    )
  );
}
