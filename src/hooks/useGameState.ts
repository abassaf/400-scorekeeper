import { useReducer, useEffect } from "react";
import type { GameState, PlayerEntry, PlayerIndex, Round } from "../types";
import { calcRound, runningTotals, playerScore } from "../scoring";

export type GameAction =
  | { type: "START_GAME"; players: [string, string, string, string]; scoreLimit: number }
  | { type: "ADD_ROUND"; entries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry] }
  | { type: "UNDO_ROUND" }
  | { type: "NEW_GAME" }
  | { type: "KEEP_PLAYING" }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "EDIT_ROUND"; roundId: number; entries: Round["entries"]; comment?: string };

const initialState: GameState = {
  phase: "setup",
  players: ["Player 1", "Player 2", "Player 3", "Player 4"],
  scoreLimit: 80,
  rounds: [],
  winner: null,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function clampEntry(entry: PlayerEntry): PlayerEntry {
  return {
    called: clamp(entry.called, 2, 13),
    obtained: clamp(entry.obtained, 0, 13),
  };
}

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

function resolveWinner(
  rounds: Round[],
  scoreLimit: number,
): { winner: "A" | "B" | null; phase: GameState["phase"] } {
  const totals = runningTotals(rounds);
  const aCanWin = canWin(totals.a, scoreLimit, rounds, [0, 1]);
  const bCanWin = canWin(totals.b, scoreLimit, rounds, [2, 3]);
  let winner: "A" | "B" | null = null;
  if (aCanWin && bCanWin) {
    winner = totals.a >= totals.b ? "A" : "B";
  } else if (aCanWin) {
    winner = "A";
  } else if (bCanWin) {
    winner = "B";
  }
  return { winner, phase: winner !== null ? "finished" : "playing" };
}

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
      const newRound: Round = {
        id: state.rounds.length + 1,
        entries: clampedEntries,
        teamAScore,
        teamBScore,
      };
      const newRounds = [...state.rounds, newRound];
      return { ...state, rounds: newRounds, ...resolveWinner(newRounds, state.scoreLimit) };
    }

    case "UNDO_ROUND": {
      if (state.rounds.length === 0) return state;
      const newRounds = state.rounds.slice(0, -1);
      return { ...state, rounds: newRounds, ...resolveWinner(newRounds, state.scoreLimit) };
    }

    case "EDIT_ROUND": {
      const idx = state.rounds.findIndex((r) => r.id === action.roundId);
      if (idx === -1) return state;
      const clampedEntries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry] = [
        clampEntry(action.entries[0]),
        clampEntry(action.entries[1]),
        clampEntry(action.entries[2]),
        clampEntry(action.entries[3]),
      ];
      const { teamAScore, teamBScore } = calcRound(clampedEntries);
      const existingComment = state.rounds[idx].comment;
      const updatedRound: Round = {
        ...state.rounds[idx],
        entries: clampedEntries,
        teamAScore,
        teamBScore,
        comment: "comment" in action
          ? (action.comment?.trim().slice(0, 200) || undefined)
          : existingComment,
      };
      const newRounds = [
        ...state.rounds.slice(0, idx),
        updatedRound,
        ...state.rounds.slice(idx + 1),
      ];
      return { ...state, rounds: newRounds, ...resolveWinner(newRounds, state.scoreLimit) };
    }

    case "NEW_GAME":
      return { ...initialState };

    case "KEEP_PLAYING":
      return { ...state, phase: "playing", winner: null };

    case "LOAD_STATE":
      return action.state;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

const STORAGE_KEY = "400-scorekeeper-state";

export function isValidState(parsed: unknown): parsed is GameState {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    "phase" in parsed &&
    "players" in parsed &&
    "rounds" in parsed &&
    Array.isArray((parsed as GameState).players) &&
    Array.isArray((parsed as GameState).rounds)
  );
}

export function stateToShareUrl(state: GameState): string {
  const encoded = encodeURIComponent(btoa(JSON.stringify(state)));
  return `${window.location.origin}${window.location.pathname}#state=${encoded}`;
}

function loadState(): GameState {
  try {
    const searchAndHash = window.location.search + window.location.hash;
    const match = searchAndHash.match(/[#?&]state=([^&#]*)/);
    if (match) {
      const decoded: unknown = JSON.parse(atob(decodeURIComponent(match[1])));
      if (isValidState(decoded)) {
        history.replaceState(null, "", window.location.pathname);
        return decoded;
      }
    }
  } catch {
    // fall through
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
    }
  } catch {
    // fall through
  }
  return initialState;
}

export function useGameState(): { state: GameState; dispatch: React.Dispatch<GameAction> } {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently ignore write errors
    }
  }, [state]);

  return { state, dispatch };
}
