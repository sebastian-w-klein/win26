// The 21 draft slots, in the order printed on Card A ("The Lean Machine").
// `cost` is the baseline credit price band used by Solo (cap) mode.
//
// `weight` is the slot's leverage, and it does two jobs at once: it is the
// slot's share of its category's unit rating, and -- because a category's
// share of the whole is the sum of its slots' weights -- it is also the
// category's share of the roster. Those cancel, so a slot's pull on the final
// margin is exactly weight / (sum of all weights). Read the column as
// percentages of a campaign: at a total of 28.0, the campaign manager is 10.7%
// of the operation and the policy director is 2.5%.
//
// The scale is anchored on what a bad hire actually costs a presidential
// campaign, not on how senior the title sounds:
//
//   3.0      runs the whole operation; every other slot's work passes through it
//   1.6-2.2  owns one of the four engines: message, money, air war, ground war
//   1.1-1.5  multiplies an engine's output without owning it
//   0.7-1.0  a real job whose failures stay contained inside one department
//
// The previous table ran 1.0 to 1.6, which priced the campaign manager at 1.6
// press secretaries and left the finance director -- who is upstream of the ad
// buy, the offices and the payroll -- tied at the bottom with the creative
// director. Top-to-bottom leverage is now 4.3:1 rather than 1.6:1.

export const CATEGORIES = {
  COMMAND:  { id: 'COMMAND',  label: 'Command',  color: '#f2c14e' },
  COMMS:    { id: 'COMMS',    label: 'Comms',    color: '#4d9dff' },
  DIGITAL:  { id: 'DIGITAL',  label: 'Digital',  color: '#cfe84a' },
  FIELD:    { id: 'FIELD',    label: 'Field',    color: '#4fd8c0' },
  FINANCE:  { id: 'FINANCE',  label: 'Finance',  color: '#f0a848' },
  OPS:      { id: 'OPS',      label: 'Ops',      color: '#f2793d' },
  POLICY:   { id: 'POLICY',   label: 'Policy',   color: '#8b7bf7' },
  RESEARCH: { id: 'RESEARCH', label: 'Research', color: '#e8563f' },
  TECH:     { id: 'TECH',     label: 'Tech',     color: '#9aa6b2' },
  FLOATER:  { id: 'FLOATER',  label: 'Floater',  color: '#f2546b' }
};

export const ROLES = [
  { n: 1,  id: 'campaign-manager',    title: 'Campaign Manager',         cat: 'COMMAND',  weight: 3.0  },            // runs it all: budget, hiring, the candidate’s time
  { n: 2,  id: 'deputy-cm',           title: 'Deputy Campaign Manager',  cat: 'COMMAND',  weight: 0.8  },            // executes the CM’s plan; mostly insurance
  { n: 3,  id: 'senior-adviser',      title: 'Senior Adviser',           cat: 'COMMAND',  weight: 1.1  },            // influence without line authority
  { n: 4,  id: 'chief-strategist',    title: 'Chief Strategist',         cat: 'COMMAND',  weight: 2.2  },            // owns the message and the theory of the electorate
  { n: 5,  id: 'comms-director',      title: 'Communications Director',  cat: 'COMMS',    weight: 1.8  },            // sets the earned-media frame, the free megaphone
  { n: 6,  id: 'press-secretary',     title: 'Press Secretary',          cat: 'COMMS',    weight: 0.7  },            // delivers the comms director’s plan
  { n: 7,  id: 'rapid-response',      title: 'Rapid Response Director',  cat: 'COMMS',    weight: 1.0  },            // kills the bad week before it is a bad month
  { n: 8,  id: 'digital-director',    title: 'Digital Director',         cat: 'DIGITAL',  weight: 1.8  },            // this cycle, the main persuasion AND fundraising channel
  { n: 9,  id: 'new-media-director',  title: 'New Media Director',       cat: 'DIGITAL',  weight: 1.0  },            // reach the paid buy cannot purchase
  { n: 10, id: 'paid-media',          title: 'Paid Media Specialist',    cat: 'DIGITAL',  weight: 1.6  },            // spends the largest line in the budget
  { n: 11, id: 'creative-director',   title: 'Creative Director',        cat: 'DIGITAL',  weight: 0.9  },            // raises the ceiling of the buy, not its size
  { n: 12, id: 'national-field',      title: 'National Field Director',  cat: 'FIELD',    weight: 2.0  },            // the turnout operation; the classic point or two
  { n: 13, id: 'deputy-field',        title: 'Deputy Field Director',    cat: 'FIELD',    weight: 0.8  },            // runs the plan out in the states
  { n: 14, id: 'political-director',  title: 'Political Director',       cat: 'FIELD',    weight: 1.2  },            // endorsements, coalitions, state parties
  { n: 15, id: 'finance-director',    title: 'Finance Director',         cat: 'FINANCE',  weight: 1.7  },            // upstream of everything -- no money, no campaign
  { n: 16, id: 'operations-director', title: 'Operations Director',      cat: 'OPS',      weight: 0.9  },            // invisible when good, fatal when bad; raises the floor
  { n: 17, id: 'policy-director',     title: 'Policy Director',          cat: 'POLICY',   weight: 0.7  },            // decisive for governing, least of any slot for margin
  { n: 18, id: 'research-director',   title: 'Research Director',        cat: 'RESEARCH', weight: 1.1  },            // oppo and self-vetting; asymmetric downside
  { n: 19, id: 'data-director',       title: 'Data Director',            cat: 'TECH',     weight: 1.4  },            // targeting quality multiplies field and paid media
  { n: 20, id: 'chief-pollster',      title: 'Chief Pollster',           cat: 'FLOATER',  weight: 1.5  },            // the one slot graded on measured data; steers the spend
  { n: 21, id: 'general-counsel',     title: 'General Counsel',          cat: 'FLOATER',  weight: 0.8  }             // understated here -- the recount mechanic pays separately
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map(r => [r.id, r]));
