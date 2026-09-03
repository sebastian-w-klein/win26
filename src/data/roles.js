// The 21 draft slots, in the order printed on Card A ("The Lean Machine").
// `weight` is how heavily the slot's pick counts toward its unit rating.
// `cost` is the baseline credit price band used by Solo (cap) mode.

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
  { n: 1,  id: 'campaign-manager',     title: 'Campaign Manager',        cat: 'COMMAND',  weight: 1.6 },
  { n: 2,  id: 'deputy-cm',            title: 'Deputy Campaign Manager', cat: 'COMMAND',  weight: 1.0 },
  { n: 3,  id: 'senior-adviser',       title: 'Senior Adviser',          cat: 'COMMAND',  weight: 1.1 },
  { n: 4,  id: 'chief-strategist',     title: 'Chief Strategist',        cat: 'COMMAND',  weight: 1.5 },
  { n: 5,  id: 'comms-director',       title: 'Communications Director', cat: 'COMMS',    weight: 1.4 },
  { n: 6,  id: 'press-secretary',      title: 'Press Secretary',         cat: 'COMMS',    weight: 1.0 },
  { n: 7,  id: 'rapid-response',       title: 'Rapid Response Director', cat: 'COMMS',    weight: 1.1 },
  { n: 8,  id: 'digital-director',     title: 'Digital Director',        cat: 'DIGITAL',  weight: 1.4 },
  { n: 9,  id: 'new-media-director',   title: 'New Media Director',      cat: 'DIGITAL',  weight: 1.2 },
  { n: 10, id: 'paid-media',           title: 'Paid Media Specialist',   cat: 'DIGITAL',  weight: 1.2 },
  { n: 11, id: 'creative-director',    title: 'Creative Director',       cat: 'DIGITAL',  weight: 1.0 },
  { n: 12, id: 'national-field',       title: 'National Field Director', cat: 'FIELD',    weight: 1.5 },
  { n: 13, id: 'deputy-field',         title: 'Deputy Field Director',   cat: 'FIELD',    weight: 1.0 },
  { n: 14, id: 'political-director',   title: 'Political Director',      cat: 'FIELD',    weight: 1.2 },
  { n: 15, id: 'finance-director',     title: 'Finance Director',        cat: 'FINANCE',  weight: 1.0 },
  { n: 16, id: 'operations-director',  title: 'Operations Director',     cat: 'OPS',      weight: 1.0 },
  { n: 17, id: 'policy-director',      title: 'Policy Director',         cat: 'POLICY',   weight: 1.0 },
  { n: 18, id: 'research-director',    title: 'Research Director',       cat: 'RESEARCH', weight: 1.0 },
  { n: 19, id: 'data-director',        title: 'Data Director',           cat: 'TECH',     weight: 1.0 },
  { n: 20, id: 'chief-pollster',       title: 'Chief Pollster',          cat: 'FLOATER',  weight: 1.2 },
  { n: 21, id: 'general-counsel',      title: 'General Counsel',         cat: 'FLOATER',  weight: 1.0 }
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map(r => [r.id, r]));
