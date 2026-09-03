# How a draft is scored

Every number in this document is a gameplay dial. The goal was a game that rewards the same
instincts a real campaign rewards, not a forecast. Constants live in `K` in
`src/engine/scoring.js`.

## 1. Each pick becomes an effective rating

```
effective = OVR  ×  laneFit  ×  formMultiplier
```

| Lane fit | × | When |
|---|---|---|
| On lane | 1.10 | The pick is a natural fit for your lane |
| Mercenary | 1.00 | Works for whoever is paying |
| Off lane | 0.92 | Right party, wrong faction |
| Cross-party | 0.62 | You hired the other side's operative |

Current form — whether they won or lost their most recent cycle — multiplies by 1.025, 0.975
or 1.0. Form is **derived from the credit line** by an ordered rule list in
`src/data/operatives.js`, so it is auditable rather than hand-assigned, and the most recent
cycle wins the match. Jen O'Malley Dillon ran Biden 2020 and chaired Harris 2024, so she
carries the 2024 loss.

## 2. Picks become ten unit ratings

Each slot contributes its effective rating to its category, weighted by slot weight — Campaign
Manager (1.6) counts far more than Deputy Field Director (1.0). Empty slots score at
replacement level, 70. Spec tags then add: unit tags (`turnout`, `viral`, `analytics`, …) add
2.4 to their category, axis tags (`union`, `latino`, `rural`, …) feed the coalition profile.

## 3. Ratings meet the map

For each of eleven battlegrounds, margin is four things added together:

```
margin = PVI + national + coalition + operation
```

**PVI** — Cook's 2025 vintage, flipped to your side's point of view.

**National** — the environment preset, plus how your lane runs against a generic nominee of
your own party. Lane appeal is *centered* on its own side's average, because PVI already
encodes a generic Democrat against a generic Republican. Without centering, every lane would
double-count its own party's baseline.

**Coalition** — your lane's appeal across seven electorate axes, dotted with that state's
electorate weights, plus what your specialist hires add. The roster half is measured against
a baseline of 0.50, which is what a typical drafted roster does — measured over 2,640
simulated state-rosters. Without that subtraction, specialist tags were a free +0.7 margin
for everyone, since no tag is ever negative.

**Operation** — your unit ratings weighted by what the state rewards, minus the opposition's.
State emphasis multipliers are raised to the **third power**, because raw multipliers of
1.05–1.40 barely move a ten-category weighted mean. Before that fix, the operation term was
±0.36 across the whole map — effectively a constant. After it, a field-heavy roster is worth
about 1.9 margin points more in Wisconsin than in Virginia.

The opposing operation is rated 90 in solo mode. In a league it becomes the field's own
average, so a strong league is a harder election night for everyone in it.

Inside a 0.6-point margin, a decisive edge in legal firepower flips the state — the recount.

## 4. Why the toss-up preset is D+3.6

A tied national popular vote does not produce a tied Electoral College on this map, so the
environment labels and their numbers deliberately do not line up.

Democrats have exactly one cheap path to 270: hold the four states leaning their way (NM, VA,
MN, NH) and then sweep Pennsylvania, Michigan **and** Wisconsin — which lands on 270 on the
nose. Republicans need the Sunbelt plus one. Sweeping a blue wall priced at R+2, R+1 and R+2
takes a real national win, so against an equally good campaign the Electoral College does not
become a coin flip until about **D+3.6**.

That is not a guess. It is where head-to-head matchups actually balance, measured over 480
simulated matchups per setting:

| Environment | Popular vote | D wins head-to-head |
|---|---|---|
| Republican wave | R+1 | 0% |
| Lean Republican | D+1.5 | 0% |
| **Toss-up** | **D+3.6** | **49%** |
| Lean Democratic | D+5.5 | 100% |
| Democratic wave | D+8 | 100% |

Median gap at toss-up: 14 electoral votes.

## 5. The draft score

```
score = 1000 × ( 0.45·map + 0.25·units + 0.15·fit + 0.15·tippingPoint )
```

`map` is the share of the 125 contested electoral votes you captured, measured from your own
side's safe-state floor — the two sides have different floors (D 194, R 219), so scoring
against a shared range would hand Republicans free points for the same achievement.

`tippingPoint` is the margin in the state that delivered your 270th electoral vote.

## Known asymmetry

Tech Right and Libertarian Right can field only ~85% of an ideal roster, against 94–98% for
the four major lanes, because the pool genuinely thins out there. They are flagged **hard
mode** in the lane picker rather than papered over — it is a real strategic cost, and the
bots avoid those lanes on their own for exactly that reason.
