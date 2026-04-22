import { useState } from 'react';
import type { GameState, Round } from '../types';

export interface HistoryEntry {
  id: string;
  completedAt: number;
  players: [string, string, string, string];
  scoreLimit: number;
  rounds: Round[];
  winner: 'A' | 'B' | null;
}

const HISTORY_KEY = '400-scorekeeper-history';

export function isValidHistoryEntry(val: unknown): val is HistoryEntry {
  return (
    typeof val === 'object' &&
    val !== null &&
    'id' in val &&
    'completedAt' in val &&
    'players' in val &&
    'rounds' in val &&
    'winner' in val
  );
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isValidHistoryEntry);
  } catch {
    // ignore
  }
  return [];
}

function persist(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage quota errors
  }
}

export function useGameHistory(): {
  history: HistoryEntry[];
  saveGame: (state: GameState) => string | undefined;
  updateGame: (id: string, state: GameState) => void;
  deleteGame: (id: string) => void;
  clearAll: () => void;
} {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  function saveGame(state: GameState): string | undefined {
    if (state.phase === 'setup' || state.rounds.length === 0) return undefined;
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      completedAt: Date.now(),
      players: [...state.players] as [string, string, string, string],
      scoreLimit: state.scoreLimit,
      rounds: state.rounds,
      winner: state.winner,
    };
    const next = [entry, ...history];
    persist(next);
    setHistory(next);
    return entry.id;
  }

  function updateGame(id: string, state: GameState): void {
    const next = history.map((e) =>
      e.id === id ? { ...e, rounds: state.rounds, winner: state.winner } : e,
    );
    persist(next);
    setHistory(next);
  }

  function deleteGame(id: string): void {
    const next = history.filter((e) => e.id !== id);
    persist(next);
    setHistory(next);
  }

  function clearAll(): void {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }

  return { history, saveGame, updateGame, deleteGame, clearAll };
}
