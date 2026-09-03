/** Tiny hyperscript helper. h('div.cls', {attrs}, ...children) */
export function h(spec, props, ...kids) {
  const [tag, ...classes] = String(spec).split('.');
  const el = document.createElement(tag || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (props && (props.nodeType || Array.isArray(props) || typeof props !== 'object')) { kids.unshift(props); props = null; }
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className += (el.className ? ' ' : '') + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const kid of kids) {
    if (kid == null || kid === false) continue;
    if (Array.isArray(kid)) add(el, kid);
    else el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const mount = (el, ...kids) => add(clear(el), kids);
export const fmt = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(1);
export const pct = n => Math.round(n * 100) + '%';
export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
export function toast(msg, tone = '') {
  const t = h('div', { class: `toast ${tone}`, role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}
