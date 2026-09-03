# War Room Draft 2028

Fantasy football, but for the people who actually run presidential campaigns.

You draft an **ideological lane** and then **21 real operatives, strategists and firms** — one
for every slot on the 2028 Campaign Draft card. Your roster is then run through the
battleground map and scored against Cook PVI, each pick's most recent cycle, and how well
the people you hired fit the campaign you said you were running.

![The draft board mid-league, Liberal Institutionalist lane](docs/board.png)

## Playing

```bash
npm run serve      # http://localhost:8127
```

ES modules need to be served over HTTP, so opening `index.html` off the filesystem will not
work. If you want a file you can just double-click, build one:

```bash
npm install
npm run build      # -> dist/standalone.html, a single self-contained file
npm run check      # parse every module
```

## The game

**Round 0 — the lane.** Eight lanes, four per side. Your lane sets your national ceiling,
decides which voters you over- and under-perform with in each battleground, and determines
which operatives count as *on lane*. In a league it is exclusive: one war room per lane.

**Rounds 1–21 — the board.** One round per slot, in card order. In a league draft the order
snakes and every pick is exclusive, so the board thins as you go. In solo mode there are no
rivals, just a 1,200-credit salary cap.

**Election night.** Your roster produces ten unit ratings and a coalition profile, which are
run across eleven battlegrounds carrying 125 electoral votes.

Two modes score differently, on purpose:

- **Solo / shared link** runs you against a generic well-run opposing campaign.
- **A league** runs you against the field that drafted out of the same pool, and adds true
  head-to-head matchups against every rival on the other side — there, only one of you can win.

## Three things decide it

**Fit beats talent.** Every pick is multiplied by how well it fits your lane: on lane 1.10,
right party but wrong faction 0.92, cross-party 0.62. Drafting the highest-rated name on the
board regardless of lane is the fastest way to lose. In testing, a greedy top-OVR strategy
finished on 226 electoral votes and a grade F; drafting on lane out of the same pool won the
presidency.

**Build for your map.** Each state rewards different units — Wisconsin is decided on
organization, Arizona punishes you for being broke in the Phoenix media market, New Hampshire
runs on earned media. A field-heavy roster is worth about two margin points more in Wisconsin
than the same roster is in Virginia.

**Current form counts, a little.** Whether a pick won or lost their last cycle moves their
effective rating by ±2.5%. It is a thumb on the scale, not the scale.

## Repository

```
src/data/         roles, lanes, the 161-name pool, the battleground map
src/engine/       scoring + simulation, draft order, bots, share codes
src/ui/           setup, draft board, results
tools/build.mjs   bundles to a single-file dist/
docs/SCORING.md   every formula and every tuning constant, with its reasoning
```

Share codes encode a whole roster in 23 characters; anyone opening the link sees that exact
draft scored the same way.

## About the data

Everyone in the pool is a real, public political professional, firm or organization, and the
credit line on every card is public record. **The ratings are not.** OVR, credit cost and the
spec tags are invented gameplay numbers, tuned so the draft plays well — they are not an
assessment of anyone's actual ability, and no one in the pool has anything to do with this game.

Cook PVI values are the 2025 vintage, shown rounded as Cook publishes them. The simulation
carries a decimal refinement so that Pennsylvania, Wisconsin and Nevada — all published at
R+2 — do not flip 35 electoral votes in a single step. Every refined value rounds back to its
published figure.

Everything here is a model, not a forecast.
