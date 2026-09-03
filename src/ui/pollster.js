/** Pollster cards carry real Silver Bulletin numbers; render them. */
import { h } from './dom.js';
import { POLLSTER_RATINGS } from '../data/pollster-ratings.js';
import { K } from '../engine/sim.js';

export const ratingOf = op => (op?.firm ? POLLSTER_RATINGS[op.firm] : null);

/** How this pollster's house bias reads for a war room on `side`. */
export function houseRead(r, side) {
  if (!r || !side) return null;
  const flatter = (side === 'D' ? 1 : -1) * r.bias;
  const pts = Math.max(-K.POLL_BIAS_CAP, Math.min(K.POLL_BIAS_CAP, -flatter * K.POLL_BIAS));
  if (Math.abs(pts) < 0.10) return { pts, tone: '', label: 'Straight shooter', why: 'No meaningful house lean either way — their published polls have been about even on your side.' };
  // Only a real lean earns a colored chip; a tenth of a point is noise.
  const strong = Math.abs(pts) >= 0.20;
  return pts > 0
    ? { pts, tone: strong ? 'good' : '', label: `Runs you scared +${pts.toFixed(2)}`,
        why: 'Their published polls have historically been tough on your side, which keeps a campaign honest about where it is actually behind.' }
    : { pts, tone: strong ? 'bad' : '', label: `Flatters you ${pts.toFixed(2)}`,
        why: 'Their published polls have historically overstated your side, and a campaign that believes them spends in the wrong states.' };
}

const biasLabel = b => (b > 0 ? 'D+' : 'R+') + Math.abs(b).toFixed(1);

/** Compact chips for the player list. */
export function pollsterChips(op, side) {
  const r = ratingOf(op);
  if (!r) return null;
  const read = houseRead(r, side);
  return [
    h('span.chip', { title: `Silver Bulletin grade, from ${r.polls} rated poll${r.polls === 1 ? '' : 's'}` }, `SB ${r.grade}`),
    h('span.chip', { title: read ? read.why : 'Historical statistical bias in this firm’s published polls' }, `House ${biasLabel(r.bias)}`)
  ];
}

/** The fuller block shown when a pollster card is selected. */
export function pollsterDetail(op, side) {
  const r = ratingOf(op);
  if (!r) return null;
  const read = houseRead(r, side);
  const stat = (k, v, title) => h('div', { title }, h('div.label', k), h('div.mono', { style: { fontSize: '15px', fontWeight: 700 } }, v));
  return h('div', { style: { marginTop: '8px' } },
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(74px, 1fr))', gap: '8px' } },
      stat('SB grade', r.grade, 'Silver Bulletin letter grade'),
      stat('Rated polls', r.polls, 'Public polls in the Silver Bulletin database'),
      stat('House bias', biasLabel(r.bias), 'Positive means the firm has historically overstated Democratic performance'),
      r.polls >= 8 && r.called != null ? stat('Called', r.called + '%', 'Share of rated races where the firm picked the winner') : null,
      r.polls >= 8 && r.err != null ? stat('Avg error', r.err, 'Average error on the margin, in points') : null
    ),
    read && h('p.tiny', { style: { marginTop: '8px', color: 'var(--ink-dim)' } },
      read.why, ' ',
      h('span.mono', { style: { color: read.pts > 0 ? 'var(--good)' : read.pts < 0 ? 'var(--bad)' : 'var(--ink-dim)' } },
        `${read.pts > 0 ? '+' : ''}${read.pts.toFixed(2)} pts`),
      h('span.faint', ' — measured on released public polls, which are a messaging product as much as an estimate.')),
    r.polls < 8 && h('p.tiny.faint', { style: { marginTop: '6px' } },
      `Only ${r.polls} rated poll${r.polls === 1 ? '' : 's'} — campaign pollsters work mostly in private, so this rating is reverted toward the card's editorial rating.`)
  );
}
