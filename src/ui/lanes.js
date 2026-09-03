import { h } from './dom.js';
import { AXES, AXIS_LABEL, SIDE } from '../data/lanes.js';
import { DEPTH_BY_LANE } from '../engine/draft.js';

export function laneAxes(lane) {
  return h('div.axes', AXES.map(a => {
    const v = lane.appeal[a], w = Math.min(50, Math.abs(v) / 3 * 50);
    return h('div.axis-row', h('span', AXIS_LABEL[a].replace(' voters', '').replace(' households', ' HH')),
      h('div.axis-bar', h('i', { style: { left: v >= 0 ? '50%' : `${50 - w}%`, width: `${w}%`, background: v >= 0 ? 'var(--good)' : 'var(--bad)' } })));
  }));
}
export function depthChip(lane) {
  const d = DEPTH_BY_LANE[lane.id];
  if (d >= 0.94) return h('span.chip.good', 'Deep bench');
  if (d >= 0.90) return h('span.chip.warn', 'Thin in places');
  return h('span.chip.bad', 'Hard mode');
}
export function laneCard(lane, { onPick, disabled, takenBy } = {}) {
  return h('button.lane', { style: { '--side': SIDE[lane.side].color }, disabled, onclick: () => onPick?.(lane) },
    h('div.row', h('h3.grow', lane.name), h('span.chip', { class: lane.side === 'D' ? 'd' : 'r' }, lane.side)),
    h('div.tag', lane.tag),
    h('p.blurb', lane.blurb),
    laneAxes(lane),
    h('div.row', { style: { flexWrap: 'wrap', marginTop: '4px' } }, depthChip(lane), h('span.chip', `Volatility ${lane.volatility.toFixed(1)}`), takenBy && h('span.chip.bad', `Taken · ${takenBy}`))
  );
}
