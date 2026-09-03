# War Room Draft 2028

Fantasy football, except you draft the campaign instead of the candidate.

You and up to eleven other people each build a presidential war room: first you
pick an ideological lane, then you draft 21 real operatives — the pollster, the
ad maker, the field director, the lawyer — one for every slot on the staff card.
When the board is empty, all 3,142 counties in the country vote, and the map
shows whose war room runs strongest where.

![The draft room](docs/board.png)

## Play it

**Nothing to install, nothing to download.** It runs in a browser tab.

### With coworkers — live, up to 12 seats

**→ [Open the draft room](https://claude.ai/code/artifact/8cd5d8da-ddd2-49b1-868c-cbaa709f3694)**

Type your name, create a league, and send that same link around. Seats are
first-come; whoever is still missing when the commissioner starts the draft
becomes a bot. Picks sync live, there's a chat box, and there's an optional pick
clock with autopick so one person at lunch can't stall the room.

Two things to know: the link is private until you share it from the page's
share menu, and anyone you send it to needs a Claude account to open it. If
that's a problem for your office, use the practice draft below or put the game
on GitHub Pages.

### Alone, against bots

Same link — choose **Practice draft** on the home screen instead of creating a
league. It runs entirely in your browser, needs no account, and a full 22-round
draft against bots takes a few minutes.

### On your own URL (GitHub Pages)

The repo is a plain static site, so GitHub can host it for free at
`https://sebastian-w-klein.github.io/win26/` — no account and no login for
anyone who opens it. Practice drafts work there; live leagues don't, because
the shared database that syncs picks between browsers only exists on the
Claude link above.

The workflow is already on `main`. What's left needs repository settings, which
only the owner can change:

1. **Settings → General → Danger Zone → Change visibility → Public.** Pages is
   free only for public repositories. (On a paid GitHub plan you can skip this
   and keep the repo private.)
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.** The
   workflow tries to do this itself, so check here only if step 3 fails with
   `Create Pages site failed`.
3. **Actions → Deploy to GitHub Pages → Run workflow.** It prints the URL when
   it finishes. Re-run it after any change you want live.

Before flipping to public, know what becomes visible: the whole history, and
that means 345 named real political professionals carrying invented OVR and
cost numbers. The disclaimer above covers it, but it stops being a private
joke at that point. The vendored Silver Bulletin ratings CSV in `data/raw/` is
also worth a look against how you'd want to redistribute it publicly.

## How a draft goes

### Round 1 — pick a lane

Twelve lanes, six per party, and no two war rooms can share one. Your lane is
the biggest decision you make: it sets your national ceiling, decides which
voters you over- and under-perform with across ten measured groups (union
households, college grads, rural voters, under-30s, non-college white voters,
and five more), and determines which operatives count as *on lane* for you.

### Rounds 2–22 — fill the staff card

The order snakes. On the clock, you take any operative whose slot you still have
open, and the pool is 345 names deep.

Every pick gets multiplied by how well the person fits your lane: **1.10** on
lane, **0.92** for the right party but the wrong faction, **0.62** across party
lines. A brilliant hire who doesn't believe in your campaign is worth less than
a good one who does.

Two rules worth knowing before your first draft:

- **Firms come as a package.** Where one card owns or is a partner in another
  card's shop, they're a single hire — draft Anna Greenberg and you also get
  GQR, and both leave the board for everyone else. Twenty-six shops work this
  way. Merely sharing a former employer doesn't count; anyone can hire out of a
  rival's alumni network.
- **You can never be stuck.** If a slot runs dry, there's always a
  replacement-level free agent — competent, unremarkable, never drafted away.

### Election night

Your 21 hires become ten unit ratings and a coalition profile, and that gets run
through every county in the country. States are the vote-weighted sum of their
counties, and the Electoral College is the sum of the states. In a live league
you run against the field's own average, plus a true head-to-head against every
rival on the other side.

## The map

Every county is shaded for whichever war room runs strongest in it. Hover for
each room's share of that county, search any county or state by name, or switch
to the state view for the same thing aggregated up.

County leans are the average of the 2020 and 2024 presidential results relative
to the national vote — the way Cook computes PVI — and they land within about a
point of Cook's published state numbers.

The hover also carries three numbers measured across four presidential cycles
rather than two:

| | what it means |
|---|---|
| **Elasticity** | how much the county swings from cycle to cycle, with 1.00 as the national average |
| **Drift** | where twelve years have moved it |
| **Third-party share** | how much of the vote goes elsewhere |

Elasticity isn't trivia — it multiplies everything a campaign controls. The same
field operation is worth seven times more in Webb County, Texas (2.50) than in
Camden, New Jersey (0.35).

## The pollster slot is graded on real data

The Chief Pollster is the one slot scored against published measurements:
**Silver Bulletin's January 2026 pollster ratings**, 540 firms deep. Each of the
39 pollster cards names a real rated firm and carries its letter grade, how many
polls it's rated on, its house bias, hit rate, average error, and the share of
its polls that missed outside their own margin of error.

A card's rating starts from the firm's Predictive Plus-Minus and is pulled back
toward the card's editorial rating based on how thin the record is — campaign
pollsters mostly poll privately, and some are rated on a handful of public
releases.

That makes depth of record the thing to draft for. Mason-Dixon is rated on 446
polls, InsiderAdvantage on 208, Trafalgar on 143; at those counts the
measurement is doing 91% or more of the work. At the other end, Big Data Poll is
an F on six polls — the one card in the slot you should probably leave alone.

House bias is a live mechanic, not flavor text. Hire a firm whose polls have
historically flattered your own side and you lose margin everywhere, because a
campaign that believes its own friendly numbers spends in the wrong states.

## What's real and what isn't

**Real:** every name in the pool. All 345 are public political professionals,
firms or organizations, and the credit line on each card is public record.

**Invented:** all the ratings. OVR, cost and spec tags are gameplay numbers
tuned so the draft plays well. They are not an assessment of anyone's ability,
and nobody in the pool has anything to do with this game.

**Measured, with its sourcing:** county margins for 2024 and 2020 come from the
county results files, 2016 and 2012 from MIT Election Lab, and elasticity, drift
and third-party share are derived from those four cycles. County demographics —
including the non-college white share and median household income the two newest
axes run on — come from the Census via MIT Election Lab, and are about a decade
old even though the vote data is current. Alaska has no county-level source at
all and falls back to statewide values. State union membership is the one
hand-entered number in the build and the weakest data in it; `data/raw/SOURCES.md`
explains why and what fixing it would take.

It's a model, not a forecast.

## Working on it

```bash
npm install
npm run serve        # http://localhost:8127 — plays the source directly, no build step
npm run build        # -> dist/standalone.html (one file) and dist/index.html (artifact body)
npm run build:data   # regenerate the county tables from data/raw/
npm run check        # parse every module
npm run balance      # re-measure the environment presets
```

Where things live:

```
src/data/         roles, lanes, the 345-name pool, generated county + state tables
src/engine/       sim.js (counties → states → EV), scoring, draft order + bots
src/net/          identity, LocalStore (practice) and SharedStore (live, on the artifact db)
src/ui/           lobby, league room, draft room, results, the map
tools/            build-counties.mjs, build.mjs, balance.mjs, check.sh
data/raw/         vendored sources, see SOURCES.md
docs/SCORING.md   every formula and constant, with its reasoning
```

To update the live link after changing the game: `npm run build`, then republish
`dist/index.html` to the same artifact URL.
