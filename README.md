# Sizzle & Serve — a rush-hour burger kitchen

[![Competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/bingx12/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/bingx12/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete 2D cooking game that runs from static files — no build step, no network requests, no copied assets. Every sprite is drawn on canvas and every sound is synthesized with WebAudio.

## How to play

You are the chef of a small burger kitchen on a 120-second shift. Tickets land on the order board with a patience timer; cook each one before it walks out.

- **Move** — WASD / arrow keys, or click anywhere on the floor to walk there.
- **Grab** — press `E` near a station, or click the station: buns, salad, cheese and sauce come straight off the counter.
- **Grill** — grab a raw patty, put it on the grill, and take it off inside the green zone. Too early and it is raw; too late and it burns.
- **Stack** — click the assembly plate (or press Space near it) to place what you carry. Bun first, then the ticket's layers in order.
- **Serve** — click the serve window (or press Space there) when the plate matches a ticket. A match scores base points plus a patience bonus and grows your combo; a mismatch scores almost nothing and breaks the combo.
- **Trash** — dump a burnt patty or a wrong ingredient in the trash bin.
- `P` pauses, `M` mutes, `R` restarts after the shift ends.

Three strikes — three tickets walking out — and the kitchen closes early.

## Recipes

| Ticket | Stack (bottom to top) | Points |
| --- | --- | --- |
| Classic | bun, patty, salad | 100 |
| Cheesy | bun, patty, cheese, sauce | 130 |
| Garden | bun, salad, cheese | 110 |
| Double | bun, patty, patty, cheese | 160 |
| Sunrise | bun, patty, salad, sauce | 140 |

## Layout

```
game/
  index.html          page shell + canvas
  src/
    config.js         constants, recipes, station layout
    audio.js          synthesized WebAudio effects
    input.js          keyboard + mouse intent
    orders.js         order board, patience, scoring
    chef.js           chef movement and carrying
    kitchen.js        stations, grill, plate, serve window
    render.js         all canvas drawing (kitchen, food, HUD)
    shots.js          deterministic ?shot= scenes for screenshots
    main.js           game loop and state machine
main.ts               hands game/ + screenshots/ to /output with a dossier
serve.ts              local static server (node serve.ts → http://localhost:8080)
screenshots/          3–4 real renders of the game
```

## Run it

```sh
node serve.ts
# open http://localhost:8080 — play, then ?shot=play&seed=1 for the kitchen scene
```

## Screenshots

The cover (`1-kitchen.jpg`) shows the kitchen mid-rush: three tickets on the board, a patty on the grill in the green zone, a dish mid-assembly on the plate, the chef carrying cheese, and the shift timer running. `2-serve.jpg` shows a finished Classic ready at the serve window, `3-start.jpg` the title screen, and `4-over.jpg` the end of a shift.

---

Built for the [best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) on make.fun. Play more games like this at https://make.fun/r/k6eq9xtw
