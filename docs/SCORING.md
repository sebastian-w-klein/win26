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

## 3. The county simulation

For every county, from the drafting side's point of view:

```
margin = lean + national + coalition + operation
```

- **lean** — the county's two-cycle PVI-style lean, D-positive, sign-flipped for Republican rooms.
- **national** — the environment preset (popular-vote margin) plus how the lane runs against a generic nominee of its own party. Lanes are centered on their side's average so the party baseline is not counted twice.
- **coalition** — Σ over seven axes of the roster's appeal × the county's z-scored demographic (clipped at ±2.5 SD) × 0.55. Because z-scores are vote-weighted to a national mean of zero, coalition work is nationally neutral: it moves *where* you win, not how much.
- **operation** — the roster's unit strength, weighted by what the state rewards (emphasis multipliers cubed, or they barely register), minus the opponent's: 90 for a generic campaign, the field average in a league.

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
last three weeks of a race, and campaign pollsters work mostly in private. Public
Opinion Strategies has 80 rated polls; Fabrizio Lee has 11; brilliant corners has
one. A rating built on one poll is noise, so thin samples fall back toward the
card's editorial rating — the same move Silver Bulletin makes internally.

Each firm's **house bias** then becomes a game mechanic. A firm whose published
polls have historically overstated *your* side flatters you into spending in the
wrong places; one that has been tough on your side keeps you running scared:

```
flatter = (side === 'D' ? +1 : −1) × houseBias
polling = clamp(−flatter × 0.18, ±0.6)          margin points, everywhere
```

It is deliberately small — at most ±0.48 across the current pool, against ±2.8
for the operation term — so it is a tiebreaker between two good pollsters, not a
reason to hire the other party's. It does create one real draft decision: Cygnal
is both the best-rated Republican firm (A, 58 polls) *and* carries a D+2.0 house
lean, so it is worth +0.37 to a Republican war room. GQR is an A− with 62 polls
but its D+2.2 lean costs a Democratic war room 0.39.

## 4. Head to head and the map

Head to head is the same equation with every term differenced against the rival, so exactly one of them wins each state.

The map's per-room shares are a softmax over each room's county margin (temperature 2.5 points), so they sum to 100% across the room and same-side rosters split a county by how strongly each actually runs there.

## 5. Why the toss-up preset is D+3.5

A tied popular vote is not a tied Electoral College on this map. Democrats have to sweep Pennsylvania, Michigan and Wisconsin (about R+2, R+1, R+1.7 in the county data) to reach 270. Measured over 24 eight-seat bot leagues, the head-to-head coin flip lands at D+4.0:

| Preset | Popular vote | D wins head-to-head |
|---|---|---|
| Republican wave | R+2.0 | 0% |
| Lean Republican | D+2.5 | 6% |
| **Toss-up** | **D+4.0** | **49%** |
| Lean Democratic | D+5.0 | 77% |
| Democratic wave | D+6.5 | 100% |

The toss-up moved from D+3.5 to D+4.0 when the pollster house-effect mechanic
went in: Democratic firms in the Silver Bulletin data carry larger house biases
than Republican ones, so Democratic war rooms eat more flattery on average and
needed the map re-centered.

## 6. The draft score

```
score = 1000 × ( 0.40·map + 0.25·units + 0.15·fit + 0.20·tippingPoint )
```

`map` is electoral votes normalized over 170–370; `tippingPoint` is the margin in the state that delivered the 270th vote.

## Known asymmetries

Libertarian Right has nine on-lane names in the pool and Tech Right nineteen, against 65–106 for the major lanes. They are flagged *hard mode* in the lane picker rather than papered over; the bots avoid them on their own.
