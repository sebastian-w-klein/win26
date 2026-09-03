// Ideological lanes. Your lane is Round 0 of the draft and is EXCLUSIVE:
// once a war room takes a lane, nobody else in the league can run it.
//
// `appeal` scores the lane against seven electorate axes, from -3 to +3.
// Every battleground state weights those axes differently (see map.js), so a
// lane that is worth +2.4 in Wisconsin can be worth -0.8 in Virginia.
//
// `env` is the lane's baseline national environment in margin points, expressed
// from the point of view of the lane's own side.
// `volatility` widens the floor/ceiling band shown on the results screen.
//
// These are editorial gameplay values, not measurements. See docs/SCORING.md.

export const AXES = ['union', 'college', 'latino', 'black', 'rural', 'young', 'senior'];

export const LANES = [
  {
    id: 'prog-populist',
    name: 'Progressive Populist',
    side: 'D',
    tag: 'Econ-first, anti-corporate, union hall over donor call',
    blurb:
      'Class-war framing, Medicare-for-All-style universal programs, picket lines and ' +
      'stadium rallies. Big small-dollar ceiling, soft with older and college-suburban voters.',
    appeal: { union: 3.0, college: -0.5, latino: 1.0, black: 0.5, rural: 1.0, young: 2.5, senior: -1.0 },
    env: 0.4,
    volatility: 2.6,
    capPremium: -40
  },
  {
    id: 'mainstream-prog',
    name: 'Mainstream Progressive',
    side: 'D',
    tag: 'Movement energy, institutional delivery',
    blurb:
      'The governing wing of the left: structural reform with a legislative theory of ' +
      'change. Strong with young and college voters, still fighting for non-college trust.',
    appeal: { union: 1.0, college: 2.0, latino: 1.0, black: 1.5, rural: -1.5, young: 2.0, senior: -1.0 },
    env: 0.9,
    volatility: 2.0,
    capPremium: -15
  },
  {
    id: 'liberal-inst',
    name: 'Liberal Institutionalist',
    side: 'D',
    tag: 'Coalition, competence, guardrails',
    blurb:
      'The Obama-Biden coalition run by the book: Black and suburban turnout, alliances, ' +
      'and a democracy-and-decency closing argument. Highest floor, lowest ceiling.',
    appeal: { union: 1.0, college: 2.0, latino: 0.5, black: 2.0, rural: -1.0, young: 0.0, senior: 1.0 },
    env: 1.2,
    volatility: 1.3,
    capPremium: 20
  },
  {
    id: 'abundance-mod',
    name: 'Abundance Moderate',
    side: 'D',
    tag: 'Build things, cut red tape, govern from the middle',
    blurb:
      'Supply-side liberalism: housing, permitting, energy, cost-of-living. Sands off the ' +
      'cultural edges to hold suburbs and seniors. Bleeds enthusiasm on the left flank.',
    appeal: { union: 0.5, college: 2.5, latino: 0.5, black: 0.5, rural: 0.5, young: 0.5, senior: 1.5 },
    env: 1.5,
    volatility: 1.6,
    capPremium: 25
  },
  {
    id: 'maga-populist',
    name: 'MAGA Populist',
    side: 'R',
    tag: 'Nationalist, anti-establishment, grievance-fueled',
    blurb:
      'Immigration and trade at the center, media as the foil, rally-driven turnout of ' +
      'low-propensity voters. Enormous rural and non-college strength, hard ceiling in suburbs.',
    appeal: { union: 2.0, college: -2.0, latino: 1.5, black: 0.5, rural: 3.0, young: 1.0, senior: 1.0 },
    env: 1.0,
    volatility: 2.8,
    capPremium: 10
  },
  {
    id: 'fusionist-con',
    name: 'Fusionist Conservative',
    side: 'R',
    tag: 'Reagan three-legged stool, updated',
    blurb:
      'Tax cuts, hawkish foreign policy, faith and family. The old coalition: seniors, ' +
      'exurbs, chamber-of-commerce money. Struggles to hold the populist base excited.',
    appeal: { union: -0.5, college: 1.0, latino: 0.0, black: -0.5, rural: 2.0, young: -1.0, senior: 2.5 },
    env: 1.3,
    volatility: 1.4,
    capPremium: 15
  },
  {
    id: 'tech-right',
    name: 'Tech Right',
    side: 'R',
    tag: 'Abundance from the other direction, very online',
    blurb:
      'Builders, crypto, energy dominance, and a podcast-native media plan. Wins young men ' +
      'and donor whales, weak with seniors and organized labor.',
    appeal: { union: -1.0, college: 1.5, latino: 0.0, black: 0.0, rural: 0.5, young: 2.0, senior: -1.0 },
    env: 0.7,
    volatility: 2.4,
    capPremium: -10
  },
  {
    id: 'libertarian-r',
    name: 'Libertarian Right',
    side: 'R',
    tag: 'Leave-me-alone coalition',
    blurb:
      'Spending hawks, civil liberties, end-the-wars. Real reach with young independents ' +
      'and rural voters, almost no institutional party support to lean on.',
    appeal: { union: -1.5, college: 1.0, latino: 0.0, black: -0.5, rural: 1.5, young: 1.5, senior: -0.5 },
    env: 0.2,
    volatility: 2.9,
    capPremium: -45
  }
];

export const LANE_BY_ID = Object.fromEntries(LANES.map(l => [l.id, l]));
export const LANES_BY_SIDE = {
  D: LANES.filter(l => l.side === 'D'),
  R: LANES.filter(l => l.side === 'R')
};
