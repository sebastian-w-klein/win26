# How a draft is scored

Every number here is a gameplay dial. Constants live in `K` in `src/engine/sim.js`; the environment presets in `src/engine/scoring.js` are set by `npm run balance`.

## 1. Each pick becomes an effective rating

```
effective = OVR × laneFit × form
```

| Lane fit | × |
|---|---|
| On lane | 1.10 |
| Free agent / mercenary | 1.00 |
| Off lane (right party, wrong faction) | 0.92 |
| Cross-party | 0.62 |

Form is whether they won or lost their most recent cycle (×1.025 / ×0.975), derived from the credit line by an ordered rule list in `src/data/operatives.js` so it is auditable.

## 2. Picks become ten unit ratings and a coalition profile

Each slot feeds its category weighted by slot weight (Campaign Manager 1.6 … Deputy Field Director 1.0). Empty slots score at 70. Unit spec tags add 2.4 to their category; axis tags (`union`, `latino`, `rural`, …) move the roster's coalition appeal on that axis.

There are ten axes, seven of them original and three added in the second data
pass, each backed by a county-level measurement:

| Axis | Measured as | Spec tag |
|---|---|---|
| `union` | state union membership rate (the one state-level axis) | `union` |
| `college` | share of adults with a degree | `suburban` |
| `latino` / `black` | share of population | `latino` / `black` |
| `rural` | share of population living rurally | `rural` |
| `young` / `senior` | under-30 and 65+ share | `young` / `senior` |
| `ncwhite` | **non-college white share of adults** | `noncollege` |
| `income` | **median household income** | `affluent` |
| `protest` | **third-party share of votes cast, 2016 and 2024 averaged** | `outsider` |

`ncwhite` is the axis the college number alone cannot express: it is the
variable the 2012-2024 realignment actually ran along, and it is what separates
Labor Liberal from Mainstream Progressive on the same map. `income` separates
the cost-of-living lanes from the chamber-of-commerce ones. `protest` measures
how many voters in a county have already shown they will vote for neither major
party, and it is the reason the Libertarian Right lane exists: it runs strongest
in Utah, Idaho, North Dakota and Colorado, where that pool is two to four times
the national average.

## 3. The county simulation

For every county, from the drafting side's point of view:

```
margin = lean + national + elasticity × (coalition + operation + polling)
```

- **lean** — the county's two-cycle PVI-style lean, D-positive, sign-flipped for Republican rooms.
- **national** — the environment preset (popular-vote margin) plus how the lane runs against a generic nominee of its own party. Lanes are centered on their side's average so the party baseline is not counted twice.
- **coalition** — Σ over ten axes of the roster's appeal × the county's z-scored measurement (clipped at ±2.5 SD) × 0.55. Because z-scores are vote-weighted to a national mean of zero, coalition work is nationally neutral: it moves *where* you win, not how much.
- **operation** — the roster's unit strength, weighted by what the state rewards (emphasis multipliers cubed, or they barely register), minus the opponent's: 90 for a generic campaign, the field average in a league.
- **elasticity** — how movable this county has actually been, measured over four cycles. See below.

## 3a. Elasticity: which counties will listen

Everything on the right-hand side of that multiplication is something a campaign
controls. None of it lands the same way everywhere. A county that has sat at
R+20 through 2012, 2016, 2020 and 2024 is not going to be talked out of it by a
better field director; one that went from D+5 to R+12 has voters who change
their minds.

So the build measures it instead of assuming it. A county's *lean* in a cycle is
its margin minus that year's national margin. `churn` is the mean absolute
change in that lean across the three transitions 2012→2016→2020→2024, and
`elasticity` is churn divided by the vote-weighted national mean of churn — 5.6
points per cycle — so the average county is exactly 1.00. The raw number runs
from 0.35 to 2.5, which would swing campaign effects 7:1 across the map, so
`K.ELASTICITY` (0.5) takes half of it:

```
effect = 1 + 0.5 × (elasticity − 1)
```

Because elasticity is normalized on the vote-weighted mean, this moves *where*
a good operation shows up without changing how much it is worth nationally —
the same trick the coalition axes use. The consequence at the table is that
Nevada (0.46) and New Hampshire (0.62) are close to fixed, while Minnesota
(1.22), Georgia (1.15) and Wisconsin (1.04) reward the room that out-organizes
the field.

State margin is the vote-weighted mean of its counties. A state within 0.6 points goes to whoever has the legal edge — the recount. Win probabilities are logistic in the margin with a scale that widens with lane volatility.

## 3b. Your pollster

The Chief Pollster slot is the one place with published outside numbers behind it.
Every card names a firm in the **Silver Bulletin pollster ratings** (January 2026),
and its OVR is derived from that firm's Predictive Plus-Minus rather than an
editorial guess:

```
sbRating = 81 − 9.8 × predictivePlusMinus        (clipped to 58–95)
OVR      = w · sbRating + (1 − w) · editorial     where w = polls / (polls + 15)
```

The reversion matters because Silver Bulletin rates *released public polls* in the
last three weeks of a race, and campaign pollsters work mostly in private.
Mason-Dixon has 446 rated polls; Public Opinion Strategies has 80; Fabrizio Lee
has 11; brilliant corners has one. A rating built on one poll is noise, so thin
samples fall back toward the card's editorial rating — the same move Silver
Bulletin makes internally.

Each firm's **house bias** then becomes a game mechanic. A firm whose published
polls have historically overstated *your* side flatters you into spending in the
wrong places; one that has been tough on your side keeps you running scared:

```
flatter = (side === 'D' ? +1 : −1) × houseBias
polling = clamp(−flatter × 0.08, ±0.25)         margin points, everywhere
```

It is deliberately small — capped at ±0.25 points, against ±2.8 for the
operation term — so it is a tiebreaker between two good pollsters, not a reason
to hire the other party's. It does create real draft decisions: Cygnal is both a
top-rated Republican firm (A, 58 polls) *and* carries a D+2.0 house lean, so it
pays a Republican war room; GQR is an A− with 62 polls whose D+2.2 lean costs a
Democratic one. Trafalgar's R+1.9 lean does the same thing to a Republican room
in reverse.

The second data pass took the slot from 26 cards to 39 by pulling in rated firms
the pool had never reached — OnMessage, Moore Information, Grove Insight, EMC,
FM3, Wick, Trafalgar, InsiderAdvantage, RMG, Big Data Poll, Selzer and
Mason-Dixon. The last few matter out of proportion to their number: Mason-Dixon
has 446 rated polls, InsiderAdvantage 208 and Trafalgar 143, which means the
reversion weight `w` is 0.91-0.97 and their OVR is very nearly all measurement
and almost none of anybody's opinion. Big Data Poll is the other end — an F
grade on six polls, and the only card in the slot that is a trap.

Each card also carries the firm's **share of polls that landed outside their own
margin of error**, straight from the ratings table.

## 3c. Firm ties

Where a card owns or is a partner in another card's shop, the two are the same
hire. Drafting either one **retains the whole firm** for that war room and takes
the rest off the board for every team — the way a polling or media firm signs
with one campaign in a race. Anna Greenberg is a partner at GQR, so you cannot
hire both, and neither can anyone else once one of them is gone.

Twenty-six shops are tied this way, from two-card pairs (GMMB and Jim Margolis,
Civis Analytics and Dan Wagner, OnMessage Inc. and Wes Anderson) to three-card
shops (Precision Strategies: Jen O'Malley Dillon, Stephanie Cutter and Teddy
Goff; Crooked Media: Favreau, Pfeiffer and Vietor). Only ownership counts — sharing a former employer does
not, or the nine people in this pool who worked on Trump 2024 would collapse
into one pick.

The bots price the lockout in: taking a partner is worth a little extra because
it denies the shop to everyone else.

## 4. Head to head and the map

Head to head is the same equation with every term differenced against the rival, so exactly one of them wins each state.

The map's per-room shares are a softmax over each room's county margin (temperature 2.5 points), so they sum to 100% across the room and same-side rosters split a county by how strongly each actually runs there.

## 5. Why the toss-up preset is D+3.5

A tied popular vote is not a tied Electoral College on this map. Democrats have to sweep Pennsylvania, Michigan and Wisconsin (about R+2, R+1, R+1.7 in the county data) to reach 270. Measured over 24 eight-seat bot leagues, the head-to-head coin flip lands at D+3.5:

| Preset | Popular vote | D wins head-to-head |
|---|---|---|
| Republican wave | R+2.0 | 0% |
| Lean Republican | D+2.5 | 13% |
| **Toss-up** | **D+3.5** | **49%** |
| Lean Democratic | D+5.0 | 73% |
| Democratic wave | D+6.5 | 100% |

This number moves whenever the pool does, which is why `npm run balance` exists.
It went to D+4.0 when the pollster house-effect mechanic landed (Democratic
firms in the Silver Bulletin data carry larger house biases, so Democratic war
rooms eat more flattery) and back to D+3.5 when the pool grew to 312 names. The
second data pass — three new axes, the elasticity multiplier, and 45 more cards
— left the coin flip where it was but flattened the curve either side of it,
which is why Lean Democratic moved from D+4.5 to D+5.0: at D+4.5 it was winning
52% of head-to-heads and reading as a second toss-up.

## 6. The draft score

```
score = 1000 × ( 0.40·map + 0.25·units + 0.15·fit + 0.20·tippingPoint )
```

`map` is electoral votes normalized over 170–370; `tippingPoint` is the margin in the state that delivered the 270th vote.

## Known asymmetries

The pool is not evenly spread across the twelve lanes, because the profession
is not. Liberal Institutionalist has 134 on-lane names and Fusionist
Conservative 107; Libertarian Right has 15 and Tech Right 25. They are flagged
*hard mode* in the lane picker rather than papered over, and the bots avoid them
on their own.

What the second data pass changed is that the thin lanes are no longer thin
*and* pointless. The `protest` axis is the measured third-party vote, and
Libertarian Right is the only lane built to collect it: it runs 2-7 points ahead
of its own side's baseline in Utah, Idaho, North Dakota and Colorado. A short
bench that owns a real piece of the map is a trade-off. A short bench that owns
nothing was a bug.
