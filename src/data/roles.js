// The 21 draft slots, in the order printed on Card A ("The Lean Machine").
// `cost` is the baseline credit price band used by Solo (cap) mode.
//
// `weight` is the card's own running order made numeric. Card A prints the
// slots in priority order, so slot 1 is the heaviest and slot 21 the lightest,
// and the column just walks down that gradient: 3.0 at the campaign manager to
// 0.6 at the general counsel, about 5:1 top to bottom.
//
// The weight does two jobs that cancel out. It is the slot's share of its
// category's unit rating, and -- because a category's share of the whole is the
// sum of its slots' weights -- it is also that category's share of the roster.
// So a slot's pull on the final margin is exactly weight / 29.2. Read the
// column as percentages of a campaign: the campaign manager is 10.3% of the
// operation, the general counsel 2.1%.
//
// Because the card is laid out department by department, the departments
// inherit the same gradient: COMMAND is 34.9% of a campaign, COMMS 18.8%,
// DIGITAL 18.5%, FIELD 10.3%, and the single-slot departments trail behind.
// FLOATER is the one block that reads out of order at 4.1%, and only because
// it holds two slots rather than one.
//
// This is the card's editorial ranking, not a merit argument, and in three
// places it says something a campaign hand would argue with: the chief
// pollster is the only slot graded on measured data and sits at 0.6; the
// finance director is upstream of the ad buy and the payroll and sits at 0.9;
// the deputy campaign manager is the second heaviest slot on the board. The
// card is the spec -- if those move, they move on the card first.
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
  { n: 1,  id: 'campaign-manager',    title: 'Campaign Manager',         cat: 'COMMAND',  weight: 3.0  },            // runs it all; every other slot passes through them
  { n: 2,  id: 'deputy-cm',           title: 'Deputy Campaign Manager',  cat: 'COMMAND',  weight: 2.6  },            // the card ranks the second chair second
  { n: 3,  id: 'senior-adviser',      title: 'Senior Adviser',           cat: 'COMMAND',  weight: 2.4  },            // influence without line authority
  { n: 4,  id: 'chief-strategist',    title: 'Chief Strategist',         cat: 'COMMAND',  weight: 2.2  },            // owns the message and the theory of the electorate
  { n: 5,  id: 'comms-director',      title: 'Communications Director',  cat: 'COMMS',    weight: 2.0  },            // sets the earned-media frame, the free megaphone
  { n: 6,  id: 'press-secretary',     title: 'Press Secretary',          cat: 'COMMS',    weight: 1.8  },            // the daily face of the campaign
  { n: 7,  id: 'rapid-response',      title: 'Rapid Response Director',  cat: 'COMMS',    weight: 1.7  },            // kills the bad week before it is a bad month
  { n: 8,  id: 'digital-director',    title: 'Digital Director',         cat: 'DIGITAL',  weight: 1.5  },            // persuasion and fundraising in one channel
  { n: 9,  id: 'new-media-director',  title: 'New Media Director',       cat: 'DIGITAL',  weight: 1.4  },            // reach the paid buy cannot purchase
  { n: 10, id: 'paid-media',          title: 'Paid Media Specialist',    cat: 'DIGITAL',  weight: 1.3  },            // spends the largest line in the budget
  { n: 11, id: 'creative-director',   title: 'Creative Director',        cat: 'DIGITAL',  weight: 1.2  },            // raises the ceiling of the buy, not its size
  { n: 12, id: 'national-field',      title: 'National Field Director',  cat: 'FIELD',    weight: 1.1  },            // the turnout operation
  { n: 13, id: 'deputy-field',        title: 'Deputy Field Director',    cat: 'FIELD',    weight: 1.0  },            // runs the plan out in the states
  { n: 14, id: 'political-director',  title: 'Political Director',       cat: 'FIELD',    weight: 0.9  },            // endorsements, coalitions, state parties
  { n: 15, id: 'finance-director',    title: 'Finance Director',         cat: 'FINANCE',  weight: 0.9  },            // raises what everything else spends
  { n: 16, id: 'operations-director', title: 'Operations Director',      cat: 'OPS',      weight: 0.8  },            // invisible when good, fatal when bad
  { n: 17, id: 'policy-director',     title: 'Policy Director',          cat: 'POLICY',   weight: 0.8  },            // decisive for governing, less so for margin
  { n: 18, id: 'research-director',   title: 'Research Director',        cat: 'RESEARCH', weight: 0.7  },            // oppo and self-vetting; asymmetric downside
  { n: 19, id: 'data-director',       title: 'Data Director',            cat: 'TECH',     weight: 0.7  },            // targeting quality multiplies field and paid media
  { n: 20, id: 'chief-pollster',      title: 'Chief Pollster',           cat: 'FLOATER',  weight: 0.6  },            // graded on measured data; house bias still bites
  { n: 21, id: 'general-counsel',     title: 'General Counsel',          cat: 'FLOATER',  weight: 0.6  }             // understated -- the recount mechanic pays separately
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map(r => [r.id, r]));
