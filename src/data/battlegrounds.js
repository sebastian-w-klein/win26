// Editorial notes and unit emphasis for the states that decide it. `emphasis`
// multiplies the campaign units that actually move votes there; every other
// state uses the default weighting. Leans come from the county data, not here.

export const BATTLEGROUNDS = {
  PA: { note: 'The tipping point. Six media markets, two of them brutal.', mediaCost: 'Very High',
        emphasis: { FIELD: 1.30, COMMS: 1.20, FINANCE: 1.15 } },
  MI: { note: 'Auto locals, Dearborn, and a huge low-propensity pool in Wayne County.', mediaCost: 'High',
        emphasis: { FIELD: 1.25, DIGITAL: 1.10, COMMAND: 1.05 } },
  WI: { note: 'Smallest persuadable pool in the country. Won on organization, not ads.', mediaCost: 'Moderate',
        emphasis: { FIELD: 1.40, OPS: 1.15, TECH: 1.10 } },
  MN: { note: 'Iron Range keeps drifting. Democrats defend, Republicans probe.', mediaCost: 'Moderate',
        emphasis: { FIELD: 1.15, RESEARCH: 1.10 } },
  AZ: { note: 'Maricopa is the whole state. Phoenix airtime eats budgets alive.', mediaCost: 'Very High',
        emphasis: { DIGITAL: 1.30, FINANCE: 1.25, FIELD: 1.05 } },
  NV: { note: 'Two counties, one union. The most machine-dependent state on the board.', mediaCost: 'Low',
        emphasis: { FIELD: 1.35, OPS: 1.15 } },
  NM: { note: 'Cheap, Latino-heavy, and only in play in a wave.', mediaCost: 'Low',
        emphasis: { FIELD: 1.25, DIGITAL: 1.10 } },
  GA: { note: 'Atlanta metro turnout against everywhere else. Registration is the game.', mediaCost: 'High',
        emphasis: { FIELD: 1.30, TECH: 1.15, FINANCE: 1.05 } },
  NC: { note: 'Fastest-changing electorate on the map. Your models will be wrong.', mediaCost: 'High',
        emphasis: { TECH: 1.25, DIGITAL: 1.20, FIELD: 1.05 } },
  VA: { note: 'NoVa federal workforce plus the DC market. Policy fights land here.', mediaCost: 'High',
        emphasis: { COMMS: 1.20, POLICY: 1.20 } },
  NH: { note: 'Retail politics and the Boston market. Cheapest EVs available.', mediaCost: 'Low',
        emphasis: { COMMS: 1.30, COMMAND: 1.10 } },
  TX: { note: 'Forty electoral votes and a Latino electorate that moved hard in 2024. A reach.', mediaCost: 'Extreme',
        emphasis: { FINANCE: 1.30, DIGITAL: 1.15 } },
  FL: { note: 'Off the board since 2020 unless something breaks. Expensive to find out.', mediaCost: 'Extreme',
        emphasis: { FINANCE: 1.25, COMMS: 1.10 } },
  OH: { note: 'Sherrod Brown country in a state that has stopped voting like it.', mediaCost: 'High',
        emphasis: { FIELD: 1.15, COMMS: 1.10 } },
  IA: { note: 'Gone red twice by 8, but the polling says otherwise every four years.', mediaCost: 'Low',
        emphasis: { RESEARCH: 1.15, FIELD: 1.10 } },
  ME: { note: 'Statewide is safe; the second district is not.', mediaCost: 'Low',
        emphasis: { COMMS: 1.15 } }
};

export const BATTLEGROUND_IDS = Object.keys(BATTLEGROUNDS);
export const CORE_BATTLEGROUNDS = ['PA', 'MI', 'WI', 'MN', 'AZ', 'NV', 'NM', 'GA', 'NC', 'VA', 'NH'];
