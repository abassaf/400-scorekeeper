import { useRef } from 'react';
import type { HistoryEntry } from '../hooks/useGameHistory';
import type { GameState } from '../types';
import { ScoreHeader } from './ScoreHeader';
import { RoundHistory } from './RoundHistory';
import { PlayerStats } from './PlayerStats';
import { ExportCard } from './ExportCard';
import { useExport } from '../hooks/useExport';

interface HistoryDetailProps {
  entry: HistoryEntry;
  onBack: () => void;
  onLoadIntoGame: () => void;
}

export function HistoryDetail({ entry, onBack, onLoadIntoGame }: HistoryDetailProps) {
  const exportCardRef = useRef<HTMLDivElement>(null);
  const { exportImage, exporting } = useExport(exportCardRef);

  const isUnfinished = entry.winner === null;
  const displayState: GameState = {
    phase: isUnfinished ? 'playing' : 'finished',
    players: entry.players,
    scoreLimit: entry.scoreLimit,
    rounds: entry.rounds,
    winner: entry.winner,
  };

  return (
    <div>
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }}>
        <ExportCard ref={exportCardRef} state={displayState} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm flex items-center gap-1 transition-colors"
          style={{ color: 'var(--sp-text-muted)' }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onLoadIntoGame}
          className="text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
        >
          {isUnfinished ? 'Continue Game' : 'Load into Game'}
        </button>
      </div>

      <ScoreHeader
        state={displayState}
        onNewGame={onBack}
        onExport={exportImage}
        exporting={exporting}
      />

      <RoundHistory state={displayState} />
      <PlayerStats state={displayState} />
    </div>
  );
}
