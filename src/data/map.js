// The 2028 battleground board.
//
// `pvi` is Cook Political Report Partisan Voter Index, 2025 vintage (computed off
// the 2020 + 2024 presidential results), stored as a signed number where POSITIVE
// means the state leans Republican. Cook publishes whole points, so `pvi` is what
// the card shows; `pviExact` carries a decimal refinement used by the sim only.
// Without it Pennsylvania, Wisconsin and Nevada all sit on exactly R+2 and 35
// electoral votes flip in a single step, which makes the map play as a cliff
// instead of a ladder. Every pviExact rounds to its published pvi.
//
// `electorate` weights the seven lane-appeal axes for that state. `emphasis`
// multiplies the campaign units that actually move votes there: Nevada rewards a
// field operation, Arizona punishes you for being broke in the Phoenix media market.

export const EV_TOTAL = 538;
export const EV_TO_WIN = 270;

// Non-battleground electoral votes each side banks before the sim runs.
// (2024-2032 apportionment; Maine and Nebraska treated as winner-take-all.)
export const FLOORS = { D: 194, R: 219 };

export const STATES = [
  {
    id: 'PA', name: 'Pennsylvania', ev: 19, pvi: 2, pviExact: 1.8, mediaCost: 'Very High',
    note: 'The tipping point. Six media markets, two of them brutal.',
    electorate: { union: 0.22, college: 0.18, latino: 0.07, black: 0.12, rural: 0.18, young: 0.12, senior: 0.11 },
    emphasis: { FIELD: 1.30, COMMS: 1.20, FINANCE: 1.15 }
  },
  {
    id: 'MI', name: 'Michigan', ev: 15, pvi: 1, pviExact: 1.2, mediaCost: 'High',
    note: 'Auto locals, Dearborn, and a huge low-propensity pool in Wayne County.',
    electorate: { union: 0.24, college: 0.17, latino: 0.04, black: 0.13, rural: 0.16, young: 0.13, senior: 0.13 },
    emphasis: { FIELD: 1.25, DIGITAL: 1.10, COMMAND: 1.05 }
  },
  {
    id: 'WI', name: 'Wisconsin', ev: 10, pvi: 2, pviExact: 2.1, mediaCost: 'Moderate',
    note: 'Smallest persuadable pool in the country. Won on organization, not ads.',
    electorate: { union: 0.18, college: 0.18, latino: 0.05, black: 0.07, rural: 0.24, young: 0.13, senior: 0.15 },
    emphasis: { FIELD: 1.40, OPS: 1.15, TECH: 1.10 }
  },
  {
    id: 'MN', name: 'Minnesota', ev: 10, pvi: -2, pviExact: -2.2, mediaCost: 'Moderate',
    note: 'Iron Range keeps drifting. Democrats defend, Republicans probe.',
    electorate: { union: 0.19, college: 0.21, latino: 0.05, black: 0.08, rural: 0.21, young: 0.13, senior: 0.13 },
    emphasis: { FIELD: 1.15, RESEARCH: 1.10 }
  },
  {
    id: 'AZ', name: 'Arizona', ev: 11, pvi: 5, pviExact: 4.8, mediaCost: 'Very High',
    note: 'Maricopa is the whole state. Phoenix airtime eats budgets alive.',
    electorate: { union: 0.07, college: 0.18, latino: 0.25, black: 0.05, rural: 0.13, young: 0.14, senior: 0.18 },
    emphasis: { DIGITAL: 1.30, FINANCE: 1.25, FIELD: 1.05 }
  },
  {
    id: 'NV', name: 'Nevada', ev: 6, pvi: 2, pviExact: 2.4, mediaCost: 'Low',
    note: 'Two counties, one union. The most machine-dependent state on the board.',
    electorate: { union: 0.18, college: 0.15, latino: 0.24, black: 0.10, rural: 0.08, young: 0.15, senior: 0.10 },
    emphasis: { FIELD: 1.35, OPS: 1.15 }
  },
  {
    id: 'NM', name: 'New Mexico', ev: 5, pvi: -3, pviExact: -3.3, mediaCost: 'Low',
    note: 'Cheap, Latino-majority-adjacent, and only in play in a wave.',
    electorate: { union: 0.09, college: 0.17, latino: 0.34, black: 0.03, rural: 0.15, young: 0.13, senior: 0.09 },
    emphasis: { FIELD: 1.25, DIGITAL: 1.10 }
  },
  {
    id: 'GA', name: 'Georgia', ev: 16, pvi: 5, pviExact: 4.6, mediaCost: 'High',
    note: 'Atlanta metro turnout against everywhere else. Registration is the game.',
    electorate: { union: 0.05, college: 0.20, latino: 0.07, black: 0.29, rural: 0.16, young: 0.14, senior: 0.09 },
    emphasis: { FIELD: 1.30, TECH: 1.15, FINANCE: 1.05 }
  },
  {
    id: 'NC', name: 'North Carolina', ev: 16, pvi: 4, pviExact: 3.6, mediaCost: 'High',
    note: 'Fastest-changing electorate on the map. Your models will be wrong.',
    electorate: { union: 0.04, college: 0.21, latino: 0.08, black: 0.21, rural: 0.21, young: 0.14, senior: 0.11 },
    emphasis: { TECH: 1.25, DIGITAL: 1.20, FIELD: 1.05 }
  },
  {
    id: 'VA', name: 'Virginia', ev: 13, pvi: -2, pviExact: -2.4, mediaCost: 'High',
    note: 'NoVa federal workforce plus the DC market. Policy fights land here.',
    electorate: { union: 0.06, college: 0.28, latino: 0.09, black: 0.18, rural: 0.15, young: 0.14, senior: 0.10 },
    emphasis: { COMMS: 1.20, POLICY: 1.20 }
  },
  {
    id: 'NH', name: 'New Hampshire', ev: 4, pvi: -2, pviExact: -1.7, mediaCost: 'Low',
    note: 'Retail politics and the Boston market. Cheapest EVs available.',
    electorate: { union: 0.08, college: 0.26, latino: 0.04, black: 0.02, rural: 0.26, young: 0.14, senior: 0.20 },
    emphasis: { COMMS: 1.30, COMMAND: 1.10 }
  }
];

// Normalize each state's electorate weights so they sum to exactly 1.
for (const s of STATES) {
  s.pviExact ??= s.pvi;
  const total = Object.values(s.electorate).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(s.electorate)) s.electorate[k] /= total;
}

export const STATE_BY_ID = Object.fromEntries(STATES.map(s => [s.id, s]));
export const EV_IN_PLAY = STATES.reduce((a, s) => a + s.ev, 0);
