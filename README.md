# 400 Scorekeeper

A scorekeeper for **400**, a Lebanese card game. Tracks bids, rounds won, running totals, and player stats across rounds, and works entirely in the browser.

**[Play it](https://abassaf.github.io/400-scorekeeper/)**

---

## The game

400 is played with 4 players split into two teams (Team A and Team B). Each hand is won by the highest card played, with one exception: if a player has run out of the suit led, they may play a heart, which beats any non-heart card in that hand.

Each round, every player declares a bid (how many hands they think they'll win), then plays. Scoring rewards ambitious, accurate bids and punishes misses:

| Bid | Score if made |
|-----|--------------|
| 1-4 | Equal to bid |
| 5   | 10 |
| 6   | 12 |
| 7   | 14 |
| 8   | 16 |
| 9   | 27 |
| 10  | 40 |
| 11  | 44 |
| 12  | 48 |
| 13  | 52 |

If you miss your bid, you lose points equal to your bid. The first team whose running total reaches or exceeds the score limit wins.

## Features

- Enter player names and a custom score limit (default 80)
- Per-round entry for all 4 players: bid and hands won
- Live feedback on the total hands entered per round
- Running totals with progress bars toward the score limit
- Full round history table with per-player results and cumulative scores
- Per-player stats: make rate, average bid, average obtained
- Winner detection with option to keep playing or start a new game
- State persisted to `localStorage` so refreshing the page restores your game

## Running locally

Requires [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

## Tech stack

- [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Lucide React](https://lucide.dev) for icons
- Deployed to GitHub Pages via GitHub Actions

## License

MIT. See [LICENSE](LICENSE).
