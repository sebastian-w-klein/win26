/**
 * Who this browser is. There is no user capability on this runtime, so a
 * seat is claimed with a random token kept in this browser's storage — the
 * honor system among coworkers, which is what a fantasy draft runs on anyway.
 */
const KEY = 'wrd28:identity';

function fresh() {
  const bytes = new Uint8Array(12);
  (globalThis.crypto || { getRandomValues: a => a.map(() => Math.random() * 256) }).getRandomValues(bytes);
  return { token: Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''), name: '' };
}

export function identity() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const id = JSON.parse(raw); if (id?.token) return id; }
  } catch {}
  const id = fresh();
  try { localStorage.setItem(KEY, JSON.stringify(id)); } catch {}
  return id;
}

export function remember(patch) {
  const id = { ...identity(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(id)); } catch {}
  return id;
}
