# 400 Scorekeeper — Mobile Feature Transfer Design

**Date:** 2026-04-22  
**Status:** Approved  
**Scope:** Transfer all mobile-only features to the web app (deployed on GitHub Pages)

---

## Overview

The mobile app (`400-scorekeeper-mobile`) has accumulated features not yet present in the web app (`400-scorekeeper`). This spec covers transferring all of them in three focused PRs, in dependency order.

**Repos:**
- Web: `400-scorekeeper` — React + Vite + Tailwind, deployed to GitHub Pages
- Mobile: `400-scorekeeper-mobile` — React Native + Expo

**Constraint:** No backend. Everything runs client-side. All persistence via `localStorage`.

---

## Feature Inventory

| Feature | PR |
|---|---|
| Light / Dark / System theme | 1 |
| Team A (blue) / Team B (amber) color tokens | 1 |
| Animated score progress bar (CSS spring) | 1 |
| Collapsible settings panel | 1 |
| Edit Round (`EDIT_ROUND` action + modal) | 2 |
| Round comments (optional, max 200 chars) | 2 |
| New Game save prompt (Cancel / Discard / Save) | 2 |
| Import game link (web URL + app deep link) | 2 |
| `useGameHistory` hook (save/update/delete/clearAll) | 3 |
| Top tab bar (Game / History views) | 3 |
| History list view | 3 |
| History detail view (read-only scorecard) | 3 |
| Auto-save on game end + manual Save button | 3 |

---

## PR 1 — Theme System & Visual Polish

### Theme architecture

**New files:**
- `src/theme.ts` — exports `lightColors`, `darkColors`, both typed as `ThemeColors`. Includes team A/B token groups.
- `src/context/ThemeContext.tsx` — `ThemeProvider`, `useTheme()` hook. Mirrors mobile `ThemeContext` exactly.

**ThemeProvider behaviour:**
- Reads saved preference from `localStorage` key `@theme_preference` on mount.
- Listens to `window.matchMedia('(prefers-color-scheme: dark)')` for system mode.
- Exposes `{ mode, setMode, effectiveMode, colors, isDark }`.
- `mode` is `'light' | 'dark' | 'system'`. Default: `'system'`.
- Applies `dark` class to `<html>` element when effective mode is dark (Tailwind dark mode via class strategy).

**Modified files:**
- `src/main.tsx` — wrap `<App>` in `<ThemeProvider>`.
- All components — consume `useTheme()` for team-specific colors; replace hardcoded `emerald` Tailwind classes with token-driven inline styles or CSS variables where team distinction matters.

### Color tokens

```ts
// ThemeColors shape (both light and dark implement this)
interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textSubtle: string;
  textMuted: string;
  positive: string;   // emerald — made bids, positive scores
  danger: string;     // red — missed bids, blocked, negative scores
  dangerBg: string;
  accent: string;     // primary accent (buttons, links)
  accentText: string;
  progressTrack: string;
  tableRowAlt: string;
  teamA: { bg: string; border: string; solid: string; text: string };
  teamB: { bg: string; border: string; solid: string; text: string };
}
```

- **Team A:** Blue family (`blue-950` bg, `blue-800` border, `blue-500` solid, `blue-300` text in dark; adjusted for light).
- **Team B:** Amber family (`amber-950` bg, `amber-800` border, `amber-500` solid, `amber-300` text in dark).
- Positive/danger (emerald/red) remain as-is — these are game semantics, not team identity.

Applied to: `ScoreHeader` score boxes, progress bars, `ExportCard` team cards.

### Collapsible settings panel

**New file:** `src/components/SettingsPanel.tsx`

- Rendered in `App.tsx` below the score header (all phases except setup).
- Collapsed by default. Toggle button: "Settings ▾" / "Settings ▴".
- Expand/collapse via CSS `max-height` transition (no JS animation library).
- Contains: theme picker (Light / Dark / System segmented control) + import game link UI.
- Responsive: full-width on mobile, max-width constrained on desktop.

### Animated progress bar

`ScoreHeader.tsx` progress bars: replace `transition-all` with a CSS custom property approach.

```tsx
// inline style drives the width
<div
  style={{ '--bar-width': clampedPercent(total) } as React.CSSProperties}
  className="h-2 rounded-full bg-emerald-500 [width:var(--bar-width)] transition-[width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
/>
```

The `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot curve replicates the spring feel of the mobile `Animated.spring`. No new dependencies.

---

## PR 2 — Game Logic Features

Depends on PR 1 merged (theme tokens available).

### Type changes

`src/types.ts`:
```ts
interface Round {
  // existing fields ...
  comment?: string;  // ADD — optional, max 200 chars, trimmed
}
```

### Reducer changes

`src/hooks/useGameState.ts` — add to `GameAction` union:
```ts
| { type: 'LOAD_STATE'; state: GameState }
| { type: 'EDIT_ROUND'; roundId: number; entries: Round['entries']; comment?: string }
```

`EDIT_ROUND` handler (port from mobile `gameReducer.ts`):
1. Find round by `roundId`. No-op if not found.
2. Clamp all entries.
3. Recalculate `teamAScore` / `teamBScore` via `calcRound`.
4. Re-run `canWin` on all rounds → update `winner` and `phase`.
5. Comment: stored trimmed, sliced to 200 chars. If `comment` key absent in action, preserve existing comment.

`LOAD_STATE` handler: replace state entirely with `action.state` (already exists in web via `loadFromUrl` but not as a dispatchable action — promote it).

### Shared Dialog component

**New file:** `src/components/Dialog.tsx`

Reusable modal overlay. Renders as:
- **Desktop (≥640px):** fixed overlay, centered card, max-width 480px, rounded-xl.
- **Mobile (<640px):** fixed overlay, bottom-anchored sheet, full-width, rounded-t-xl, no bottom radius.

Props: `{ open, onClose, title, children }`. Uses `<dialog>` element with `backdrop` styling, or a `<div>` fixed overlay if `<dialog>` lacks sufficient browser support for the bottom-sheet pattern.

Closes on backdrop click and Escape key.

### Edit Round

**New file:** `src/components/EditRoundModal.tsx`

Uses `Dialog.tsx`. Contains:
- 2-column layout (Team A left, Team B right) with a divider.
- Per-player: name label, "Bid" number stepper (min 2, max 13), "Tricks" number stepper (min 0, max 13).
- Validation bar: shows `Bids: X · Tricks: Y` in green when valid (`calledSum ≥ 11`, `obtainedSum ≤ 13`), error text + red when invalid.
- Comment textarea: optional, max 200 chars, placeholder "Add a note for this round…".
- Save button: disabled when invalid.
- On save: dispatch `EDIT_ROUND`.

**New file:** `src/components/NumberStepper.tsx` — port of mobile component. `−` / `+` buttons with a value display. Props: `{ value, min, max, onChange, label }`.

**`RoundHistory.tsx` changes:**
- Accept optional `dispatch` prop (same pattern as mobile `RoundHistoryCard`).
- When `dispatch` present: rows get `cursor-pointer` + hover highlight; clicking opens `EditRoundModal`.
- Round `#` cell: show `●` dot indicator when `round.comment` is set. Tooltip on hover shows comment text.

### New Game save prompt

`App.tsx` — intercept `onNewGame` when `state.phase === 'playing' && state.rounds.length > 0`:
- Show `Dialog.tsx` with title "New Game" and three buttons: **Cancel**, **Discard** (destructive), **Save & New Game** (primary, only rendered once PR 3 history hook is available — in PR 2, rendered as disabled/absent).
- Discard: dispatch `NEW_GAME` directly.
- Save & New Game: `saveGame(state)` then dispatch `NEW_GAME` (wired in PR 3).

### Import game link UI

Lives inside `SettingsPanel.tsx` (from PR 1).

Parse logic — accepts both formats:
- Web: `https://abassaf.github.io/400-scorekeeper/#state=<base64>`
- App: `fourhundredscorekeeper://?state=<base64>`

Regex: `/[#?&]state=([^&]*)/` — matches `#state=`, `?state=`, and `&state=`.

On submit:
1. Extract base64 payload with the regex.
2. `JSON.parse(atob(decodeURIComponent(match[1])))`.
3. Validate with `isValidState()`.
4. Dispatch `LOAD_STATE` if valid; show inline error "Invalid link" if not.
5. Clear input on success.

---

## PR 3 — Game History

Depends on PR 2 merged.

### `useGameHistory` hook

**New file:** `src/hooks/useGameHistory.ts`

Direct port from mobile. Replaces `storage.getItem/setItem` with `localStorage.getItem/setItem`.

```ts
interface HistoryEntry {
  id: string;           // `${Date.now()}-${randomSuffix}`
  completedAt: number;  // Unix ms
  players: [string, string, string, string];
  scoreLimit: number;
  rounds: Round[];
  winner: 'A' | 'B' | null;
}
```

Storage key: `400-scorekeeper-history`. Value: JSON array of `HistoryEntry[]`, newest first.

Exported API:
```ts
{
  history: HistoryEntry[];
  saveGame: (state: GameState) => string | undefined;   // returns id
  updateGame: (id: string, state: GameState) => void;
  deleteGame: (id: string) => void;
  clearAll: () => void;
}
```

No async needed (localStorage is synchronous). Remove the `async/await` and `loading` state from the mobile version — not needed on web.

### View state & tab bar

`App.tsx` — add top-level view state:
```ts
type AppView = 'game' | 'history' | 'history-detail';
const [view, setView] = useState<AppView>('game');
const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
```

**New file:** `src/components/TabBar.tsx` — two tabs: "Game" and "History". Active tab highlighted with accent color. Shown in all phases. Sits above the score header / setup screen.

Switching to Game tab never resets game state — it just changes `view`.

### Auto-save wiring (`App.tsx`)

```ts
const savedIdRef = useRef<string | null>(null);
const wasSavedRef = useRef(false);

useEffect(() => {
  if (state.phase === 'finished') {
    if (!wasSavedRef.current) {
      wasSavedRef.current = true;
      const id = saveGame(state);
      if (id) savedIdRef.current = id;
    } else if (savedIdRef.current) {
      updateGame(savedIdRef.current, state);
    }
  }
  if (state.phase !== 'finished') {
    wasSavedRef.current = false;
    savedIdRef.current = null;
  }
}, [state.phase, state]);
```

Manual Save button in `ScoreHeader` (playing phase, `rounds.length > 0`): calls `saveGame(state)` if no saved id yet, otherwise `updateGame`. Shows brief "Saved" confirmation (2s state flash on button label).

New Game prompt "Save & New Game": calls `saveGame(state)` then dispatches `NEW_GAME`.

### History list view

**New file:** `src/components/HistoryList.tsx`

- Renders a list of `HistoryEntry` cards, newest first.
- Each card: winner label, player names, final scores (Team A: X · Team B: Y), date, round count.
- Click → `setSelectedEntry(entry); setView('history-detail')`.
- Per-card delete: trash icon button (confirm via inline `window.confirm` or small inline prompt).
- "Clear All" link (top-right, only when `history.length > 0`): confirm then `clearAll()`.
- Empty state: "No games yet. Start a game on the Game tab."

### History detail view

**New file:** `src/components/HistoryDetail.tsx`

Reshapes `HistoryEntry` into a `GameState`-compatible object and passes to existing display components:

```ts
const displayState: GameState = {
  phase: 'finished',
  players: entry.players,
  scoreLimit: entry.scoreLimit,
  rounds: entry.rounds,
  winner: entry.winner,
};
```

Renders:
- Back button → `setView('history')`.
- `ScoreHeader` (read-only — no `onNewGame`/`onExport` actions visible, or grayed out).
- `RoundHistory` (no `dispatch` prop → rows not clickable).
- `PlayerStats`.
- Export button → `useExport` + `ExportCard` with this game's state.

---

## Shared Constraints

- **No backend, no build-time changes** — everything client-side. GitHub Actions deploy stays unchanged.
- **ExportCard** (`src/components/ExportCard.tsx`): update team card border colors to use team A/B tokens from PR 1. Mechanism (`html-to-image` + `navigator.share()`) unchanged — it is the web equivalent of react-native-skia.
- **Import link** accepts both web (`#state=`) and app (`?state=`) URL formats via regex `/[#?&]state=([^&]*)/`.
- **Responsive** throughout: collapsible settings panel, Dialog bottom-sheet on mobile, tab bar works at all widths.
- **localStorage persistence**: survives refreshes and browser restarts. Clears in incognito on window close — same as existing game state behaviour.

---

## File Change Summary

### PR 1
| File | Change |
|---|---|
| `src/theme.ts` | New |
| `src/context/ThemeContext.tsx` | New |
| `src/components/SettingsPanel.tsx` | New |
| `src/main.tsx` | Wrap in ThemeProvider |
| `src/App.tsx` | Render SettingsPanel |
| `src/components/ScoreHeader.tsx` | Team color tokens, CSS spring progress bar |
| `src/components/ExportCard.tsx` | Team color tokens |
| `src/components/PlayerStats.tsx` | Team color tokens |
| `src/components/WinnerBanner.tsx` | Theme tokens |

### PR 2
| File | Change |
|---|---|
| `src/types.ts` | Add `comment?` to Round |
| `src/hooks/useGameState.ts` | Add EDIT_ROUND, LOAD_STATE actions |
| `src/components/Dialog.tsx` | New — shared modal/bottom-sheet |
| `src/components/NumberStepper.tsx` | New — port from mobile |
| `src/components/EditRoundModal.tsx` | New — port + adapted for web |
| `src/components/RoundHistory.tsx` | Clickable rows, dot indicator |
| `src/components/SettingsPanel.tsx` | Add import link UI |
| `src/App.tsx` | New Game prompt |

### PR 3
| File | Change |
|---|---|
| `src/hooks/useGameHistory.ts` | New — port from mobile, sync localStorage |
| `src/components/TabBar.tsx` | New |
| `src/components/HistoryList.tsx` | New |
| `src/components/HistoryDetail.tsx` | New |
| `src/App.tsx` | View state, tab bar, auto-save wiring |
| `src/components/ScoreHeader.tsx` | Add `onSave` prop + Save button (wired to useGameHistory) |
