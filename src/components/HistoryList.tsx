import React from 'react';
import type { HistoryEntry } from '../hooks/useGameHistory';
import { runningTotals } from '../scoring';

interface HistoryListProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function HistoryList({ history, onSelect, onDelete, onClearAll }: HistoryListProps) {
  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (window.confirm('Remove this game from history?')) {
      onDelete(id);
    }
  }

  function handleClearAll() {
    if (window.confirm('Remove all saved games? This cannot be undone.')) {
      onClearAll();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--sp-text-primary)' }}>
          History
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs transition-colors"
            style={{ color: 'var(--sp-danger)' }}
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base mb-1" style={{ color: 'var(--sp-text-muted)' }}>No games yet.</p>
          <p className="text-sm" style={{ color: 'var(--sp-text-subtle)' }}>
            Start a game on the Game tab.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const totals = runningTotals(entry.rounds);
            const winnerNames = entry.winner === 'A'
              ? `${entry.players[0]} & ${entry.players[1]}`
              : entry.winner === 'B'
              ? `${entry.players[2]} & ${entry.players[3]}`
              : `${entry.players[0]}, ${entry.players[1]}, ${entry.players[2]} & ${entry.players[3]}`;
            const winnerSolid = entry.winner === 'A'
              ? 'var(--sp-team-a-solid)'
              : entry.winner === 'B'
              ? 'var(--sp-team-b-solid)'
              : 'var(--sp-text-muted)';

            return (
              <div
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="rounded-xl p-4 cursor-pointer transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ color: winnerSolid }}>
                      {entry.winner ? `Team ${entry.winner} Wins` : 'Unfinished'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--sp-text-secondary)' }}>
                      {winnerNames}
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--sp-text-secondary)' }}>
                      <span style={{ color: 'var(--sp-team-a-solid)' }}>A: {totals.a}</span>
                      <span className="mx-1.5" style={{ color: 'var(--sp-text-muted)' }}>·</span>
                      <span style={{ color: 'var(--sp-team-b-solid)' }}>B: {totals.b}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--sp-text-muted)' }}>
                        {formatDate(entry.completedAt)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--sp-text-subtle)' }}>
                        {entry.rounds.length} rounds
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, entry.id)}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--sp-text-subtle)' }}
                      aria-label="Delete game"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
