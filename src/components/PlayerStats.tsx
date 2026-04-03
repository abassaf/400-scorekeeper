import { GameState, PlayerIndex } from "../types";
import { playerStats, runningTotals, playerCumulativeScore } from "../scoring";

interface PlayerStatsProps {
  state: GameState;
}

function makeRateColor(rate: number): string {
  if (rate >= 0.7) return "text-emerald-400";
  if (rate >= 0.5) return "text-yellow-400";
  return "text-red-400";
}

const PLAYER_INDICES: PlayerIndex[] = [0, 1, 2, 3];

export function PlayerStats({ state }: PlayerStatsProps) {
  const { rounds, players } = state;
  const totals = runningTotals(rounds);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        Player Stats
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {PLAYER_INDICES.map((idx) => {
          const stats = playerStats(rounds, idx);
          const score = playerCumulativeScore(rounds, idx);
          const teamLabel = idx < 2 ? "Team A" : "Team B";
          return (
            <div key={idx} className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-sm font-medium text-white truncate">
                {players[idx]}
              </p>
              <p className="text-xs text-zinc-500 mb-2">{teamLabel}</p>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-500">Score</span>
                <span className={`text-xs font-semibold ${score >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {score >= 0 ? "+" : ""}{score}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-500">Make Rate</span>
                <span
                  className={`text-xs font-medium ${makeRateColor(stats.makeRate)}`}
                >
                  {Math.round(stats.makeRate * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-500">Avg Called</span>
                <span className="text-xs font-medium text-zinc-300">
                  {stats.avgCalled.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Avg Obtained</span>
                <span className="text-xs font-medium text-zinc-300">
                  {stats.avgObtained.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-zinc-800">
        <span className="text-sm text-zinc-400">
          Team A Total:{" "}
          <span className="text-white">{totals.a} pts</span>
        </span>
        <span className="text-sm text-zinc-400">
          Team B Total:{" "}
          <span className="text-white">{totals.b} pts</span>
        </span>
      </div>
    </div>
  );
}
