# War Room Draft 2028

Fantasy football, but for the people who run presidential campaigns — built to be played live with up to twelve coworkers on one link.

You draft an **ideological lane** and then **21 real operatives, strategists and firms**, one for every slot on the staff card. Every roster is then run through **all 3,142 counties** in the country, and the results map shows which war room runs strongest in each one.

![The draft room](docs/board.png)

## Playing

**Live league** (up to 12 seats): open the published artifact, put in your name, create a league, and send the link around. Seats are claimed first-come; empty seats become bots when the commissioner starts. Picks sync in real time, with an optional pick clock and autopick.

**Practice draft**: you against bots. Works anywhere, including GitHub Pages and the standalone file.

```bash
npm install
npm run build:data   # regenerate county data from data/raw/
npm run build        # -> dist/standalone.html (single file) and dist/index.html (artifact body)
npm run check        # parse every module
npm run balance      # re-measure the environment presets
```

## The draft

**Round 1 — the lane.** Twelve lanes, six per side, exclusive. Your lane sets your national ceiling, decides which voters you over- and under-perform with, and determines which operatives are *on lane*.

**Rounds 2–22 — any open slot.** Whoever is on the clock takes any operative whose slot they still have open; the order snakes. Every pick is multiplied by lane fit: on lane 1.10, right party but wrong faction 0.92, cross-party 0.62. When a slot runs dry there is always a replacement-level **free agent**.

**Election night.** Ten unit ratings and a coalition profile per roster, run through every county. States are the vote-weighted sum of their counties; the Electoral College is the sum of the states. In a league the opposing operation is the field's own average, and every rival on the other side gets a true head-to-head.

## The map

Each county is shaded for the war room that runs strongest there. Hover for every room's share (a softmax over each room's county margin, so the shares sum to 100%), search any county or state, and switch to the state view to see the same thing aggregated. County leans are the average of the 2020 and 2024 presidential results relative to the national vote — the way Cook computes PVI — and reproduce Cook's published state values within about a point.

## Repository

```
src/data/         roles, lanes, the 251-name pool, generated county + state tables
src/engine/       sim.js (counties → states → EV), scoring, draft order + bots
src/net/          identity, LocalStore (practice) and SharedStore (live, on the artifact db)
src/ui/           lobby, league room, draft room, results, the map
tools/            build-counties.mjs, build.mjs, balance.mjs, check.sh
data/raw/         vendored sources, see SOURCES.md
docs/SCORING.md   every formula and constant, with its reasoning
```

## The pollsters

The Chief Pollster slot is graded on real data: **Silver Bulletin's January 2026
pollster ratings**, 540 firms deep. Each of the 26 pollster cards names a rated
firm — including GQR and GBAO — and carries its letter grade, rated poll count,
house bias, hit rate and average error. OVR comes from the firm's Predictive
Plus-Minus, mean-reverted toward the card's editorial rating by poll count,
because campaign pollsters mostly poll privately and some are rated on a handful
of public releases.

House bias is a mechanic, not decoration: hiring a firm whose polls have
historically flattered your own side costs you margin everywhere, because a
campaign that believes them spends in the wrong states.

## About the data

Everyone in the pool is a real, public political professional, firm or organization; the credit line on every card is public record. **The ratings are not.** OVR, cost and spec tags are invented gameplay numbers tuned so the draft plays well — not an assessment of anyone's ability — and no one in the pool has anything to do with this game. County demographics come from the Census via MIT Election Lab; Alaska has no county-level source and uses statewide values. Everything here is a model, not a forecast.
