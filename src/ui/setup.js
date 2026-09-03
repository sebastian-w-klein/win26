import { h, mount } from './dom.js';
import { LANES, AXES } from '../data/lanes.js';
import { ENVIRONMENTS } from '../engine/scoring.js';
import { DEPTH_BY_LANE, SOLO_CAP } from '../engine/draft.js';
import { ROLES } from '../data/roles.js';
import { OPERATIVES } from '../data/operatives.js';

const AXIS_LABEL = {
  union: 'Union', college: 'College', latino: 'Latino',
  black: 'Black', rural: 'Rural', young: 'Under 30', senior: 'Seniors'
};

export function laneAxes(lane) {
  return h('div.axes', AXES.map(a => {
    const v = lane.appeal[a];
    const w = Math.min(50, Math.abs(v) / 3 * 50);
    return h('div.axis-row',
      h('span', AXIS_LABEL[a]),
      h('div.axis-bar', h('i', {
        style: {
          left: v >= 0 ? '50%' : `${50 - w}%`,
          width: `${w}%`,
          background: v >= 0 ? 'var(--good)' : 'var(--bad)'
        }
      }))
    );
  }));
}

export function difficultyChip(lane) {
  const d = DEPTH_BY_LANE[lane.id];
  if (d >= 0.94) return h('span.chip.good', 'Deep bench');
  if (d >= 0.90) return h('span.chip.warn', 'Thin in places');
  return h('span.chip.bad', 'Hard mode · thin bench');
}

export function laneCard(lane, { onPick, disabled, selected } = {}) {
  return h('button.lane', {
    style: { '--side': lane.side === 'D' ? '#4d9dff' : '#e8563f' },
    disabled, 'aria-pressed': selected ? 'true' : 'false',
    onclick: () => onPick?.(lane)
  },
    h('div.top',
      h('div',
        h('h3', lane.name),
        h('div.tag', lane.tag)
      ),
      h('span.chip', { style: { background: lane.side === 'D' ? '#4d9dff' : '#e8563f' } }, lane.side)
    ),
    h('p.blurb', lane.blurb),
    laneAxes(lane),
    h('div.meta',
      difficultyChip(lane),
      h('span.chip.ghost', `Volatility ${lane.volatility.toFixed(1)}`),
      disabled && h('span.chip.bad', 'Taken')
    )
  );
}

export function renderSetup(root, state, start) {
  const cfg = state.cfg;
  const opt = (label, sub, active, onclick) =>
    h('button.opt', { 'aria-pressed': active ? 'true' : 'false', onclick },
      h('b', label), h('span', sub));

  const rerender = () => renderSetup(root, state, start);

  mount(root,
    h('header.mast',
      h('div',
        h('h1', 'War Room Draft 2028'),
        h('div.sub', `${ROLES.length} roles · ${OPERATIVES.length} operatives · ${LANES.length} ideological lanes`)
      ),
      h('div.right', h('b', 'Fill your picks'), 'Then run the map')
    ),
    h('div.wrap',
      h('p.lede',
        'Fantasy football, but for the people who actually run presidential campaigns. ',
        'You draft ', h('strong', 'an ideological lane'), ' and then ', h('strong', `${ROLES.length} real operatives, strategists and firms`),
        ' — one for every slot on the card. Your roster is then run through the ',
        h('strong', 'battleground map'), ", scored on Cook PVI, each pick’s track record, and how well ",
        'the people you hired actually fit the campaign you said you were running.'
      ),

      h('div.section-label', 'Mode'),
      h('div.opt-grid',
        opt('League draft', 'Snake draft against rival war rooms. Lanes and operatives are exclusive — once a pick is gone, it is gone.',
          cfg.mode === 'snake', () => { cfg.mode = 'snake'; rerender(); }),
        opt('Solo cap build', `No rivals. Build any roster you like against a ${SOLO_CAP}-credit salary cap.`,
          cfg.mode === 'solo', () => { cfg.mode = 'solo'; rerender(); })
      ),

      cfg.mode === 'snake' && h('div', null,
        h('div.section-label', 'War rooms'),
        h('div.opt-grid', [2, 3, 4, 5, 6].map(n =>
          opt(`${n} teams`, n === 1 ? '' : `You plus ${n - 1} rival${n > 2 ? 's' : ''}`,
            cfg.teams === n, () => { cfg.teams = n; rerender(); })))
      ),

      h('div.section-label', 'National environment'),
      h('p.note',
        'What kind of year 2028 is. This is the dial that decides how much room your ',
        'roster has to work with — and the labels do not match the numbers, because on ',
        'this map they do not match in real life either.'
      ),
      h('div.opt-grid', { style: { marginTop: '12px' } }, ENVIRONMENTS.map(e =>
        opt(e.label, e.sub, cfg.env === e.id, () => { cfg.env = e.id; rerender(); }))),

      h('div.section-label', 'Your war room'),
      h('div.field',
        h('label', { for: 'wr-name' }, 'Name'),
        h('input', {
          id: 'wr-name', value: cfg.name, maxlength: 34,
          oninput: e => { cfg.name = e.target.value; }
        })
      ),

      h('div', { style: { marginTop: '28px' } },
        h('button.btn', { onclick: () => start(cfg) },
          cfg.mode === 'snake' ? 'Start the draft' : 'Start building')
      ),

      h('p.disclaimer',
        'Everyone in the draft pool is a real, public political professional, firm or ',
        'organization, and the credit line on every card is public record. The ratings ',
        'are not: OVR, cost and the spec tags are invented gameplay numbers, balanced so ',
        "the draft plays well. They are not an assessment of anyone’s actual ability, ",
        'and no one here has anything to do with this game.'
      )
    )
  );
}
