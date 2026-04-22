import { Trophy } from "lucide-react";
import { runningTotals } from "../scoring";
import type { GameState } from "../types";

interface WinnerBannerProps {
  state: GameState;
  onNewGame: () => void;
  onKeepPlaying: () => void;
}

export function WinnerBanner({ state, onNewGame, onKeepPlaying }: WinnerBannerProps) {
  if (state.phase !== "finished" || state.winner === null) return null;

  const totals = runningTotals(state.rounds);
  const winner = state.winner;
  const teamANames = `${state.players[0]} & ${state.players[1]}`;
  const teamBNames = `${state.players[2]} & ${state.players[3]}`;
  const winningTeamLabel = winner === "A" ? "Team A" : "Team B";
  const winningTeamNames = winner === "A" ? teamANames : teamBNames;

  const winnerSolid = winner === "A" ? 'var(--sp-team-a-solid)' : 'var(--sp-team-b-solid)';

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: 'var(--sp-card)',
        border: '1px solid var(--sp-border)',
        borderTop: `2px solid ${winnerSolid}`,
      }}
    >
      <Trophy style={{ color: winnerSolid, width: 32, height: 32, marginBottom: 12 }} />
      <h2 className="text-2xl font-bold" style={{ color: 'var(--sp-text-primary)' }}>
        {winningTeamLabel} Wins!
      </h2>
      <p className="mt-1" style={{ color: 'var(--sp-text-secondary)' }}>{winningTeamNames}</p>
      <p className="mt-3 text-sm">
        <span style={{ color: winner === 'A' ? 'var(--sp-team-a-solid)' : 'var(--sp-text-muted)', fontWeight: winner === 'A' ? 700 : 400 }}>
          Team A: {totals.a} pts
        </span>
        <span className="mx-2" style={{ color: 'var(--sp-text-muted)' }}>·</span>
        <span style={{ color: winner === 'B' ? 'var(--sp-team-b-solid)' : 'var(--sp-text-muted)', fontWeight: winner === 'B' ? 700 : 400 }}>
          Team B: {totals.b} pts
        </span>
      </p>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onNewGame}
          className="flex-1 py-2 rounded-xl font-semibold transition-colors"
          style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
        >
          New Game
        </button>
        <button
          type="button"
          onClick={onKeepPlaying}
          className="flex-1 py-2 rounded-xl transition-colors"
          style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-primary)' }}
        >
          Keep Playing
        </button>
      </div>
    </div>
  );
}
