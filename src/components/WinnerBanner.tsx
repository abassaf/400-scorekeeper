import { Trophy } from "lucide-react";
import { runningTotals } from "../scoring";
import type { GameState } from "../types";

interface WinnerBannerProps {
  state: GameState;
  onNewGame: () => void;
  onKeepPlaying: () => void;
}

export function WinnerBanner({ state, onNewGame, onKeepPlaying }: WinnerBannerProps) {
  if (state.phase !== "finished" || state.winner === null) {
    return null;
  }

  const totals = runningTotals(state.rounds);
  const winner = state.winner;

  // Team A: players[0] & players[1], Team B: players[2] & players[3]
  const teamANames = `${state.players[0]} & ${state.players[1]}`;
  const teamBNames = `${state.players[2]} & ${state.players[3]}`;

  const winningTeamLabel = winner === "A" ? "Team A" : "Team B";
  const winningTeamNames = winner === "A" ? teamANames : teamBNames;

  const teamAScoreClass = winner === "A" ? "text-emerald-400 font-bold" : "text-zinc-500";
  const teamBScoreClass = winner === "B" ? "text-emerald-400 font-bold" : "text-zinc-500";

  return (
    <div className="bg-zinc-900 border border-zinc-800 border-t-2 border-t-emerald-500 rounded-xl p-6 mb-6">
      <Trophy className="text-emerald-400 w-8 h-8 mb-3" />

      <h2 className="text-2xl font-bold text-white">{winningTeamLabel} Wins!</h2>

      <p className="text-zinc-400 mt-1">{winningTeamNames}</p>

      <p className="mt-3 text-sm">
        <span className={teamAScoreClass}>Team A: {totals.a} pts</span>
        <span className="text-zinc-600 mx-2">·</span>
        <span className={teamBScoreClass}>Team B: {totals.b} pts</span>
      </p>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onNewGame}
          className="flex-1 py-2 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-colors"
        >
          New Game
        </button>
        <button
          type="button"
          onClick={onKeepPlaying}
          className="flex-1 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
        >
          Keep Playing
        </button>
      </div>
    </div>
  );
}
