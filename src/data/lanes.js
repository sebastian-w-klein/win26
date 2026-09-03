// Ideological lanes. Your lane is the first pick of the draft and is EXCLUSIVE:
// once a war room takes a lane, nobody else in the league can run it. Twelve
// lanes, six per side, so a full twelve-seat league still drafts them all.
//
// `appeal` scores the lane against ten electorate axes, from -3 to +3. The
// county sim compares each county's measurements to the national average, so a
// lane strong with union households gains where union density is above the
// national norm and gives it back where it is below.
//
// Three of the ten are newer and worth naming. `ncwhite` is the non-college
// white share of adults — the axis the college number alone cannot express,
// and the one the 2012-2024 realignment ran along. `income` is median
// household income, which separates the cost-of-living lanes from the
// chamber-of-commerce ones. `protest` is the county's third-party vote share,
// averaged over 2016 and 2024: the measured size of the pool that will vote
// for neither major party, and the reason the Libertarian Right lane is worth
// running at all.
//
// `env` is the lane's baseline national environment in margin points, from the
// point of view of its own side. `volatility` widens the win-probability band
// and the floor/ceiling shown on results.
//
// These are editorial gameplay values, not measurements. See docs/SCORING.md.

export const AXES = ['union', 'college', 'latino', 'black', 'rural', 'young', 'senior',
                     'ncwhite', 'income', 'protest'];

export const AXIS_LABEL = {
  union: 'Union households', college: 'College grads', latino: 'Latino voters',
  black: 'Black voters', rural: 'Rural voters', young: 'Under 30', senior: '65 and over',
  ncwhite: 'Non-college white', income: 'High-income areas', protest: 'Third-party pool'
};

/** Ten axes do not fit a picker card at full length. */
export const AXIS_SHORT = {
  union: 'Union HH', college: 'College', latino: 'Latino', black: 'Black', rural: 'Rural',
  young: 'Under 30', senior: '65+', ncwhite: 'Non-coll wh', income: 'Income', protest: '3rd party'
};

export const SIDE = {
  D: { id: 'D', name: 'Democratic', color: '#3b82f6', ink: '#dbeafe' },
  R: { id: 'R', name: 'Republican', color: '#ef4444', ink: '#fee2e2' }
};

export const LANES = [
  /* ── Democratic ─────────────────────────────────────────────────────── */
  {
    id: 'prog-populist', name: 'Progressive Populist', side: 'D', short: 'PROG',
    tag: 'Econ-first, anti-corporate, union hall over donor call',
    blurb: 'Class-war framing, universal programs, picket lines and stadium rallies. Big small-dollar ceiling, soft with older and college-suburban voters.',
    appeal: { union: 3.0, college: -0.5, latino: 1.0, black: 0.5, rural: 1.0, young: 2.5, senior: -1.0,
              ncwhite: 1.0, income: -1.5, protest: 1.5 },
    env: 0.4, volatility: 2.6
  },
  {
    id: 'mainstream-prog', name: 'Mainstream Progressive', side: 'D', short: 'MPRG',
    tag: 'Movement energy, institutional delivery',
    blurb: 'The governing wing of the left: structural reform with a legislative theory of change. Strong with young and college voters, still fighting for non-college trust.',
    appeal: { union: 1.0, college: 2.0, latino: 1.0, black: 1.5, rural: -1.5, young: 2.0, senior: -1.0,
              ncwhite: -2.0, income: 0.5, protest: 0.5 },
    env: 0.9, volatility: 2.0
  },
  {
    id: 'liberal-inst', name: 'Liberal Institutionalist', side: 'D', short: 'INST',
    tag: 'Coalition, competence, guardrails',
    blurb: 'The Obama-Biden coalition run by the book: Black and suburban turnout, alliances, and a democracy-and-decency closing argument. Highest floor, lowest ceiling.',
    appeal: { union: 1.0, college: 2.0, latino: 0.5, black: 2.0, rural: -1.0, young: 0.0, senior: 1.0,
              ncwhite: -1.0, income: 1.0, protest: -1.0 },
    env: 1.2, volatility: 1.3
  },
  {
    id: 'abundance-mod', name: 'Abundance Moderate', side: 'D', short: 'ABND',
    tag: 'Build things, cut red tape, govern from the middle',
    blurb: 'Supply-side liberalism: housing, permitting, energy, cost of living. Sands off the cultural edges to hold suburbs and seniors. Bleeds enthusiasm on the left flank.',
    appeal: { union: 0.5, college: 2.5, latino: 0.5, black: 0.5, rural: 0.5, young: 0.5, senior: 1.5,
              ncwhite: 0.0, income: 2.0, protest: -0.5 },
    env: 1.5, volatility: 1.6
  },
  {
    id: 'labor-liberal', name: 'Labor Liberal', side: 'D', short: 'LABR',
    tag: 'Rust Belt first, dignity of work',
    blurb: 'The Sherrod Brown / Fetterman template: trade, plants, pensions, and a candidate who looks like the district. Wins back non-college voters, thin with the young and the coasts.',
    appeal: { union: 2.5, college: 0.5, latino: 0.0, black: 1.0, rural: 1.5, young: 0.0, senior: 1.0,
              ncwhite: 2.5, income: -1.5, protest: 0.0 },
    env: 1.1, volatility: 1.8
  },
  {
    id: 'multiracial-coalition', name: 'Multiracial Coalition', side: 'D', short: 'COAL',
    tag: 'Register, mobilize, expand the electorate',
    blurb: 'Georgia-model politics: registration drives, Black church networks, Latino organizers, and a bet that turnout beats persuasion. Huge upside in the Sunbelt, weak in the exurbs.',
    appeal: { union: 0.5, college: 1.0, latino: 2.0, black: 2.5, rural: -1.5, young: 1.5, senior: -0.5,
              ncwhite: -2.0, income: -0.5, protest: 0.0 },
    env: 0.8, volatility: 2.2
  },

  /* ── Republican ─────────────────────────────────────────────────────── */
  {
    id: 'maga-populist', name: 'MAGA Populist', side: 'R', short: 'MAGA',
    tag: 'Nationalist, anti-establishment, grievance-fueled',
    blurb: 'Immigration and trade at the center, media as the foil, rally-driven turnout of low-propensity voters. Enormous rural and non-college strength, hard ceiling in suburbs.',
    appeal: { union: 2.0, college: -2.0, latino: 1.5, black: 0.5, rural: 3.0, young: 1.0, senior: 1.0,
              ncwhite: 3.0, income: -2.0, protest: 1.0 },
    env: 1.0, volatility: 2.8
  },
  {
    id: 'fusionist-con', name: 'Fusionist Conservative', side: 'R', short: 'FUSN',
    tag: 'Reagan three-legged stool, updated',
    blurb: 'Tax cuts, hawkish foreign policy, faith and family. The old coalition: seniors, exurbs, chamber-of-commerce money. Struggles to keep the populist base excited.',
    appeal: { union: -0.5, college: 1.0, latino: 0.0, black: -0.5, rural: 2.0, young: -1.0, senior: 2.5,
              ncwhite: 1.0, income: 1.5, protest: -1.0 },
    env: 1.3, volatility: 1.4
  },
  {
    id: 'tech-right', name: 'Tech Right', side: 'R', short: 'TECH',
    tag: 'Abundance from the other direction, very online',
    blurb: 'Builders, crypto, energy dominance, and a podcast-native media plan. Wins young men and donor whales, weak with seniors and organized labor.',
    appeal: { union: -1.0, college: 1.5, latino: 0.0, black: 0.0, rural: 0.5, young: 2.0, senior: -1.0,
              ncwhite: -1.0, income: 2.0, protest: 1.0 },
    env: 0.7, volatility: 2.4
  },
  {
    id: 'libertarian-r', name: 'Libertarian Right', side: 'R', short: 'LBRT',
    tag: 'Leave-me-alone coalition',
    blurb: 'Spending hawks, civil liberties, end the wars. Real reach with young independents and rural voters, almost no institutional party support to lean on.',
    appeal: { union: -1.5, college: 1.0, latino: 0.0, black: -0.5, rural: 1.5, young: 1.5, senior: -0.5,
              ncwhite: 0.5, income: 0.5, protest: 3.0 },
    env: 0.2, volatility: 2.9
  },
  {
    id: 'security-hawk', name: 'National Security Hawk', side: 'R', short: 'HAWK',
    tag: 'Peace through strength, competence over grievance',
    blurb: 'The Haley / Cotton lane: China, defense, alliances, and a suburban-friendly tone. Recovers college-educated Republicans and seniors, leaves the populist base cold.',
    appeal: { union: -0.5, college: 1.5, latino: 0.5, black: -0.5, rural: 1.0, young: -1.5, senior: 2.0,
              ncwhite: -0.5, income: 1.5, protest: -1.5 },
    env: 1.1, volatility: 1.5
  },
  {
    id: 'social-conservative', name: 'Social Conservative', side: 'R', short: 'FAITH',
    tag: 'Faith, family, and the church van',
    blurb: 'Evangelical and Catholic organizing as the field program, life and religious liberty as the message. Deep in the rural South and among Latino evangelicals, brittle with the young.',
    appeal: { union: 0.0, college: -1.0, latino: 1.0, black: 0.5, rural: 2.5, young: -1.0, senior: 2.0,
              ncwhite: 2.0, income: -1.0, protest: 0.0 },
    env: 0.6, volatility: 2.0
  }
];

export const LANE_BY_ID = Object.fromEntries(LANES.map(l => [l.id, l]));
export const LANES_BY_SIDE = {
  D: LANES.filter(l => l.side === 'D'),
  R: LANES.filter(l => l.side === 'R')
};
