import { useReducer, useEffect } from "react";
import type { GameState, PlayerEntry } from "../types";
import { calcRound, runningTotals } from "../scoring";

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: "START_GAME"; players: [string, string, string, string]; scoreLimit: number }
  | { type: "ADD_ROUND"; entries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry] }
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
    called: clamp(entry.called, 1, 13),
    obtained: clamp(entry.obtained, 0, 13),
  };
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

      const aReached = totals.a >= scoreLimit;
      const bReached = totals.b >= scoreLimit;

      let winner: "A" | "B" | null = null;

      if (aReached && bReached) {
        winner = totals.a >= totals.b ? "A" : "B";
      } else if (aReached) {
        winner = "A";
      } else if (bReached) {
        winner = "B";
      }

      return {
        ...state,
        rounds: newRounds,
        phase: winner !== null ? "finished" : "playing",
        winner,
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
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "400-scorekeeper-state";

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return initialState;
    const parsed: unknown = JSON.parse(raw);
    // A basic shape check so we never hydrate with stale or corrupt data.
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "phase" in parsed &&
      "players" in parsed &&
      "rounds" in parsed
    ) {
      return parsed as GameState;
    }
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
