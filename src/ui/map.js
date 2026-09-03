/**
 * The county map. Canvas choropleth of all 3,142 counties, shaded by the
 * war room most likely to win each one, with pan/zoom, hover breakdowns,
 * county search, and a toggle that aggregates up to states.
 *
 * Hit testing uses an offscreen "picking" canvas where every county is
 * painted a unique color, so hover is one pixel read instead of thousands
 * of point-in-polygon tests.
 */
import { geoPath, geoIdentity } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { TOPO } from '../data/counties.js';
import { STATE_BY_FIPS } from '../data/states.js';
import { COUNTY_BY_FIPS } from '../engine/sim.js';
import { h, mount } from './dom.js';

const W = 975, H = 610;
const counties = feature(TOPO, TOPO.objects.counties).features.filter(f => STATE_BY_FIPS[f.id.slice(0, 2)]);
const states = feature(TOPO, TOPO.objects.states).features.filter(f => STATE_BY_FIPS[f.id]);
const stateMesh = mesh(TOPO, TOPO.objects.states, (a, b) => a !== b);
const nationMesh = mesh(TOPO, TOPO.objects.nation);
const path = geoPath(geoIdentity());
const bboxOf = f => path.bounds(f);

// Twelve distinguishable team colors: cool family for D war rooms, warm for R.
export const TEAM_PALETTE = {
  D: ['#3b82f6', '#22d3ee', '#a78bfa', '#2dd4bf', '#818cf8', '#60a5fa'],
  R: ['#ef4444', '#f97316', '#f43f5e', '#fbbf24', '#e879f9', '#fb7185']
};
export function assignColors(teams) {
  const used = { D: 0, R: 0 };
  return teams.map(t => TEAM_PALETTE[t.lane.side][used[t.lane.side]++ % 6]);
}

/**
 * entries: [{ team, color, sim }] where sim came from simulate().
 *
 * The map answers "if these war rooms all ran here, who takes the county?"
 * so each room's share is a softmax over its county MARGIN against the
 * others — the shares sum to 100% across the room, and a Democratic
 * roster in a deep-red county rounds to zero while the Republican rooms
 * split it by how strongly each one actually runs there.
 */
export const SHARE_TEMP = 2.5;   // points of margin per e-fold of share
export function buildMapModel(entries) {
  const share = ms => {
    const mx = Math.max(...ms);
    const ex = ms.map(m => Math.exp((m - mx) / SHARE_TEMP));
    const sum = ex.reduce((a, b) => a + b, 0);
    return ex.map(x => x / sum);
  };
  const byFips = {}, byState = {};
  const margins = {}, smargins = {};
  entries.forEach((e, ti) => {
    for (const r of e.sim.counties) (margins[r.c.fips] ||= [])[ti] = r.margin;
    for (const s of e.sim.states) (smargins[s.st.abbr] ||= [])[ti] = s.margin;
  });
  for (const k in margins) byFips[k] = share(margins[k]);
  for (const k in smargins) byState[k] = share(smargins[k]);
  const winner = ps => { let b = 0; for (let i = 1; i < ps.length; i++) if (ps[i] > ps[b]) b = i; return b; };
  return { entries, byFips, byState, winner };
}

export function renderMap(root, model, { meIdx = 0 } = {}) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = h('canvas', { width: W * dpr, height: H * dpr, style: { aspectRatio: `${W} / ${H}` } });
  const pick = document.createElement('canvas'); pick.width = W; pick.height = H;
  const ctx = canvas.getContext('2d'), pctx = pick.getContext('2d', { willReadFrequently: true });

  let mode = 'county';
  let view = { k: 1, x: 0, y: 0 };
  let pinned = null, hover = null;
  const colorOf = (ps) => {
    const w = model.winner(ps), p = ps[w];
    // Share → opacity: a county split three ways reads pale, a lock reads solid.
    const n = ps.length, floor = 1 / n;
    const a = 0.22 + 0.78 * Math.max(0, Math.min(1, (p - floor) / (0.9 - floor)));
    return withAlpha(model.entries[w].color, a);
  };

  /* ── picking canvas: county index → RGB ─────────────────────────────── */
  const idColor = i => `rgb(${(i >> 16) & 255},${(i >> 8) & 255},${i & 255})`;
  function paintPick() {
    pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.clearRect(0, 0, W, H);
    pctx.translate(view.x, view.y); pctx.scale(view.k, view.k);
    const feats = mode === 'county' ? counties : states;
    pctx.beginPath();
    feats.forEach((f, i) => { pctx.fillStyle = idColor(i + 1); pctx.beginPath(); path.context(pctx)(f); pctx.fill(); });
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H);
    ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
    const p = path.context(ctx);
    if (mode === 'county') {
      for (const f of counties) {
        const ps = model.byFips[f.id]; if (!ps) continue;
        ctx.fillStyle = colorOf(ps); ctx.beginPath(); p(f); ctx.fill();
      }
      ctx.lineWidth = 0.35 / view.k; ctx.strokeStyle = 'rgba(10,13,24,0.55)';
      ctx.beginPath(); p(mesh(TOPO, TOPO.objects.counties, (a, b) => a !== b)); ctx.stroke();
    } else {
      for (const f of states) {
        const ps = model.byState[STATE_BY_FIPS[f.id].abbr]; if (!ps) continue;
        ctx.fillStyle = colorOf(ps); ctx.beginPath(); p(f); ctx.fill();
      }
    }
    ctx.lineWidth = 1.1 / view.k; ctx.strokeStyle = 'rgba(238,241,248,0.55)';
    ctx.beginPath(); p(stateMesh); ctx.stroke();
    ctx.lineWidth = 1.4 / view.k; ctx.strokeStyle = 'rgba(238,241,248,0.75)';
    ctx.beginPath(); p(nationMesh); ctx.stroke();
    const focus = pinned || hover;
    if (focus) {
      ctx.lineWidth = 2 / view.k; ctx.strokeStyle = '#f5b642';
      ctx.beginPath(); p(focus.f); ctx.stroke();
    }
    paintPick();
  }

  /* ── hit test ────────────────────────────────────────────────────────── */
  function hit(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width * W, y = (clientY - r.top) / r.height * H;
    const d = pctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const i = ((d[0] << 16) | (d[1] << 8) | d[2]) - 1;
    if (i < 0 || d[3] === 0) return null;
    const f = (mode === 'county' ? counties : states)[i];
    return f ? { f, x: clientX - r.left, y: clientY - r.top } : null;
  }
  function describe(f) {
    if (mode === 'county') {
      const c = COUNTY_BY_FIPS[f.id];
      return { title: `${c.name}${/city|County|Parish|Borough|Census Area|Municipality/i.test(c.name) ? '' : ' County'}`, sub: `${STATE_BY_FIPS[f.id.slice(0, 2)].name} · ${c.votes.toLocaleString()} votes in 2024 · lean ${c.lean >= 0 ? 'D+' : 'R+'}${Math.abs(c.lean).toFixed(1)}`, ps: model.byFips[f.id] };
    }
    const st = STATE_BY_FIPS[f.id];
    return { title: st.name, sub: `${st.ev} electoral votes · lean ${st.lean >= 0 ? 'D+' : 'R+'}${Math.abs(st.lean).toFixed(1)}`, ps: model.byState[st.abbr] };
  }

  /* ── tooltip ─────────────────────────────────────────────────────────── */
  const tip = h('div.map-tip.hidden');
  function showTip(target, isPinned) {
    const { title, sub, ps } = describe(target.f);
    const order = model.entries.map((e, i) => ({ e, i, p: ps[i] })).sort((a, b) => b.p - a.p);
    const w = order[0].i;
    mount(tip,
      h('h4', title), h('div.sub', sub),
      order.map(({ e, i, p }) => h('div.trow', { class: i === w ? 'win' : '' },
        h('i', { style: { background: e.color } }),
        h('span.ellipsis', e.team.name + (i === meIdx ? ' (you)' : '')),
        h('span.p', (p * 100).toFixed(0) + '%')
      )),
      isPinned && h('div.tiny.faint', { style: { marginTop: '6px' } }, 'Click the map to unpin')
    );
    tip.classList.toggle('pinned', !!isPinned); tip.classList.remove('hidden');
    const r = canvas.getBoundingClientRect();
    const left = Math.min(target.x + 14, r.width - 240), top = Math.min(target.y + 14, r.height - 40);
    tip.style.left = `${Math.max(6, left)}px`; tip.style.top = `${Math.max(6, top)}px`;
  }
  const hideTip = () => tip.classList.add('hidden');

  /* ── interaction: pan, zoom, hover, pin ──────────────────────────────── */
  let drag = null;
  const px = v => v / canvas.getBoundingClientRect().width * W;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing'); });
  canvas.addEventListener('pointermove', e => {
    if (drag) {
      const dx = px(e.clientX - drag.x), dy = px(e.clientY - drag.y);
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      view.x = drag.vx + dx; view.y = drag.vy + dy; draw();
      if (pinned) showTip({ ...pinned, ...tipPos(pinned.f) }, true);
      return;
    }
    if (pinned) return;
    const t = hit(e.clientX, e.clientY);
    hover = t; if (t) showTip(t, false); else hideTip();
    draw();
  });
  const endDrag = e => {
    if (!drag) return;
    const wasClick = !drag.moved; drag = null; canvas.classList.remove('grabbing');
    if (wasClick) {
      const t = hit(e.clientX, e.clientY);
      if (pinned && (!t || t.f === pinned.f)) { pinned = null; hideTip(); }
      else if (t) { pinned = t; showTip(t, true); }
      draw();
    }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('grabbing'); });
  canvas.addEventListener('pointerleave', () => { if (!pinned) { hover = null; hideTip(); draw(); } });
  canvas.addEventListener('wheel', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(); zoomAt(px(e.clientX - r.left), px(e.clientY - r.top), Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  function zoomAt(cx, cy, f) {
    const k = Math.max(1, Math.min(40, view.k * f)); f = k / view.k;
    view = { k, x: cx - (cx - view.x) * f, y: cy - (cy - view.y) * f };
    clamp(); draw(); if (pinned) showTip({ ...pinned, ...tipPos(pinned.f) }, true);
  }
  function clamp() {
    view.x = Math.min(0, Math.max(W - W * view.k, view.x));
    view.y = Math.min(0, Math.max(H - H * view.k, view.y));
  }
  function tipPos(f) {
    const [[x0, y0], [x1, y1]] = bboxOf(f);
    const r = canvas.getBoundingClientRect(), s = r.width / W;
    return { x: ((x0 + x1) / 2 * view.k + view.x) * s, y: ((y0 + y1) / 2 * view.k + view.y) * s };
  }
  function zoomTo(f, pad = 1.6) {
    const [[x0, y0], [x1, y1]] = bboxOf(f);
    const k = Math.max(1, Math.min(40, Math.min(W / ((x1 - x0) * pad), H / ((y1 - y0) * pad))));
    view = { k, x: W / 2 - (x0 + x1) / 2 * k, y: H / 2 - (y0 + y1) / 2 * k };
    clamp(); draw();
  }

  /* ── search ──────────────────────────────────────────────────────────── */
  const results = h('div.map-results.hidden');
  const search = h('input.input', { type: 'search', placeholder: 'Search a county or state…', 'aria-label': 'Search counties' });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    if (q.length < 2) { results.classList.add('hidden'); return; }
    const hits = [];
    for (const f of counties) {
      const c = COUNTY_BY_FIPS[f.id]; const st = STATE_BY_FIPS[f.id.slice(0, 2)];
      const label = `${c.name}, ${st.abbr}`;
      if (label.toLowerCase().includes(q) || st.name.toLowerCase().startsWith(q) && q.length >= 4) hits.push({ f, label, sub: st.name, isState: false });
      if (hits.length >= 40) break;
    }
    for (const f of states) { const st = STATE_BY_FIPS[f.id]; if (st.name.toLowerCase().includes(q)) hits.unshift({ f, label: st.name, sub: `${st.ev} EV · state`, isState: true }); }
    mount(results, hits.slice(0, 14).map(x => h('button', { onclick: () => {
      if (x.isState !== (mode === 'state')) setMode(x.isState ? 'state' : 'county');
      zoomTo(x.f); pinned = { f: x.f, ...tipPos(x.f) }; showTip(pinned, true);
      results.classList.add('hidden'); search.value = x.label;
    } }, h('span', x.label), h('span.faint.tiny', x.sub))));
    results.classList.toggle('hidden', hits.length === 0);
  });
  search.addEventListener('blur', () => setTimeout(() => results.classList.add('hidden'), 150));

  /* ── mode toggle ─────────────────────────────────────────────────────── */
  const seg = h('div.seg');
  function setMode(m) {
    mode = m; pinned = null; hover = null; hideTip();
    mount(seg, ['county', 'state'].map(v => h('button', { 'aria-pressed': String(mode === v), onclick: () => setMode(v) }, v === 'county' ? 'Counties' : 'States')));
    draw();
  }

  const legend = h('div.map-legend',
    model.entries.map((e, i) => h('span.k', { class: i === meIdx ? 'me' : '' }, h('i', { style: { background: e.color } }), e.team.name)),
    h('span.k.faint', 'Solid = one room runs away with it · pale = split')
  );

  mount(root,
    h('div.map',
      canvas,
      h('div.map-tools',
        h('div.map-search', search, results),
        seg,
        h('div.map-zoom',
          h('button', { onclick: () => zoomAt(W / 2, H / 2, 1.6), 'aria-label': 'Zoom in' }, '+'),
          h('button', { onclick: () => zoomAt(W / 2, H / 2, 1 / 1.6), 'aria-label': 'Zoom out' }, '−'),
          h('button', { onclick: () => { view = { k: 1, x: 0, y: 0 }; draw(); }, 'aria-label': 'Reset view', style: { fontSize: '11px' } }, '⌂')
        )
      ),
      tip
    ),
    legend
  );
  setMode('county');
  return { draw, zoomTo, setMode };
}

function withAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}
