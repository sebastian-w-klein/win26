import { LANES } from './data/lanes.js';
import { ROLES } from './data/roles.js';
import { createLeague, createSolo, decodeRoster } from './engine/draft.js';
import { DEFAULT_ENV } from './engine/scoring.js';
import { renderSetup } from './ui/setup.js';
import { renderBoard } from './ui/board.js';
import { renderResults } from './ui/results.js';

const root = document.getElementById('app');

const state = {
  cfg: { mode: 'snake', teams: 4, env: DEFAULT_ENV, name: 'Your War Room' },
  allLanes: LANES,
  league: null,
  feed: [],
  soloRole: null
};

function showResults() {
  renderResults(root, state, showSetup);
  window.scrollTo({ top: 0 });
}

function start(cfg) {
  state.feed = [];
  state.soloRole = ROLES[0].id;
  state.league = cfg.mode === 'solo'
    ? createSolo({ env: cfg.env, humanName: cfg.name || 'Your War Room' })
    : createLeague({ teams: cfg.teams, env: cfg.env, humanName: cfg.name || 'Your War Room' });
  renderBoard(root, state, showResults);
  window.scrollTo({ top: 0 });
}

function showSetup() {
  history.replaceState(null, '', location.pathname + location.search);
  renderSetup(root, state, start);
  window.scrollTo({ top: 0 });
}

/** A shared link drops you straight onto that roster's results. */
function fromHash() {
  const code = location.hash.replace(/^#/, '').trim();
  if (!code) return false;
  const decoded = decodeRoster(code);
  if (!decoded) return false;

  const league = createSolo({ env: decoded.env, humanName: 'Shared draft' });
  league.teams[0].lane = decoded.lane;
  league.teams[0].roster = decoded.roster;
  league.done = true;
  state.league = league;
  state.cfg = { ...state.cfg, mode: 'solo', env: decoded.env };
  showResults();
  return true;
}

if (!fromHash()) showSetup();
window.addEventListener('hashchange', () => { if (!fromHash()) showSetup(); });
