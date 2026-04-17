import { useReducer, useEffect } from "react";
import type { GameState, PlayerEntry, PlayerIndex } from "../types";
import { calcRound, runningTotals, playerScore } from "../scoring";

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: "START_GAME"; players: [string, string, string, string]; scoreLimit: number }
  | { type: "ADD_ROUND"; entries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry] }
  | { type: "UNDO_ROUND" }
  | { type: "NEW_GAME" }
  | { type: "KEEP_PLAYING" };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: GameState = {
  phase: "setup",
  players: ["Player 1", "Player 2", "Player 3", "Player 4"],
  scoreLimit: 80,
  rounds: [],
  winner: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampEntry(entry: PlayerEntry): PlayerEntry {
  return {
    called: clamp(entry.called, 2, 13),
    obtained: clamp(entry.obtained, 0, 13),
  };
}

// A team can only win if their total reaches the scoreLimit AND every player
// on the team has a non-negative cumulative individual score.
function canWin(
  total: number,
  scoreLimit: number,
  rounds: { entries: { called: number; obtained: number }[] }[],
  playerIndices: PlayerIndex[],
): boolean {
  if (total < scoreLimit) return false;
  return playerIndices.every((i) => {
    const cumScore = rounds.reduce((sum, r) => {
      const e = r.entries[i];
      return sum + playerScore(e.called, e.obtained);
    }, 0);
    return cumScore >= 0;
  });
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      return {
        ...state,
        phase: "playing",
        players: action.players,
        scoreLimit: clamp(action.scoreLimit, 40, 500),
        rounds: [],
        winner: null,
      };
    }

    case "ADD_ROUND": {
      const clampedEntries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry] = [
        clampEntry(action.entries[0]),
        clampEntry(action.entries[1]),
        clampEntry(action.entries[2]),
        clampEntry(action.entries[3]),
      ];

      const { teamAScore, teamBScore } = calcRound(clampedEntries);

      const newRound = {
        id: state.rounds.length + 1,
        entries: clampedEntries,
        teamAScore,
        teamBScore,
      };

      const newRounds = [...state.rounds, newRound];
      const totals = runningTotals(newRounds);
      const { scoreLimit } = state;

      const aCanWin = canWin(totals.a, scoreLimit, newRounds, [0, 1]);
      const bCanWin = canWin(totals.b, scoreLimit, newRounds, [2, 3]);

      let winner: "A" | "B" | null = null;

      if (aCanWin && bCanWin) {
        winner = totals.a >= totals.b ? "A" : "B";
      } else if (aCanWin) {
        winner = "A";
      } else if (bCanWin) {
        winner = "B";
      }

      return {
        ...state,
        rounds: newRounds,
        phase: winner !== null ? "finished" : "playing",
        winner,
      };
    }

    case "UNDO_ROUND": {
      if (state.rounds.length === 0) return state;
      const newRounds = state.rounds.slice(0, -1);
      const totals = runningTotals(newRounds);
      const aCanWin = canWin(totals.a, state.scoreLimit, newRounds, [0, 1]);
      const bCanWin = canWin(totals.b, state.scoreLimit, newRounds, [2, 3]);
      let winner: "A" | "B" | null = null;
      if (aCanWin && bCanWin) {
        winner = totals.a >= totals.b ? "A" : "B";
      } else if (aCanWin) {
        winner = "A";
      } else if (bCanWin) {
        winner = "B";
      }
      return {
        ...state,
        rounds: newRounds,
        winner,
        phase: winner !== null ? "finished" : "playing",
      };
    }

    case "NEW_GAME": {
      return { ...initialState };
    }

    case "KEEP_PLAYING": {
      return {
        ...state,
        phase: "playing",
        winner: null,
      };
    }

    default: {
      // Exhaustiveness check — action is `never` here if all cases are handled.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// localStorage + URL helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "400-scorekeeper-state";

function isValidState(parsed: unknown): parsed is GameState {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    "phase" in parsed &&
    "players" in parsed &&
    "rounds" in parsed
  );
}

function loadFromUrl(): GameState | null {
  try {
    const hash = window.location.hash;
    const match = hash.match(/[#&]state=([^&]*)/);
    if (!match) return null;
    const decoded = JSON.parse(atob(decodeURIComponent(match[1])));
    if (isValidState(decoded)) {
      // Clear the hash so it doesn't persist or re-hydrate on refresh.
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function stateToShareUrl(state: GameState): string {
  const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
  return `${window.location.origin}${window.location.pathname}#state=${encoded}`;
}

function loadState(): GameState {
  const fromUrl = loadFromUrl();
  if (fromUrl !== null) return fromUrl;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return initialState;
    const parsed: unknown = JSON.parse(raw);
    if (isValidState(parsed)) return parsed;
    return initialState;
  } catch {
    return initialState;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGameState(): { state: GameState; dispatch: React.Dispatch<GameAction> } {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore write errors (e.g. private browsing quota exceeded).
    }
  }, [state]);

  return { state, dispatch };
}
