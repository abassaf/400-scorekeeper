import { runningTotals } from "../scoring";
import type { GameState } from "../types";

interface ScoreHeaderProps {
  state: GameState;
  onNewGame: () => void;
}

export function ScoreHeader({ state, onNewGame }: ScoreHeaderProps) {
  const totals = runningTotals(state.rounds);
  const { scoreLimit, players, phase, rounds } = state;

  const roundDisplay =
    phase === "playing"
      ? `Round ${rounds.length + 1}`
      : `${rounds.length} Round${rounds.length !== 1 ? "s" : ""} Played`;

  const clampedPercent = (total: number): string => {
    if (scoreLimit <= 0) return "0%";
    const pct = (total / scoreLimit) * 100;
    return `${Math.min(Math.max(pct, 0), 100)}%`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Team A */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Team A
          </p>
          <p className="text-sm text-zinc-400 mt-0.5">
            {players[0]} &amp; {players[1]}
          </p>
          <p className="text-4xl font-bold text-white mt-2">{totals.a}</p>
          <div className="mt-3 h-2 rounded-full bg-zinc-800 relative">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: clampedPercent(totals.a) }}
            />
          </div>
          {scoreLimit > 0 && (
            <p className="text-xs text-zinc-600 mt-1 text-right">
              / {scoreLimit}
            </p>
          )}
        </div>

        {/* Team B */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Team B
          </p>
          <p className="text-sm text-zinc-400 mt-0.5">
            {players[2]} &amp; {players[3]}
          </p>
          <p className="text-4xl font-bold text-white mt-2">{totals.b}</p>
          <div className="mt-3 h-2 rounded-full bg-zinc-800 relative">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: clampedPercent(totals.b) }}
            />
          </div>
          {scoreLimit > 0 && (
            <p className="text-xs text-zinc-600 mt-1 text-right">
              / {scoreLimit}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-zinc-500">{roundDisplay}</p>
        <button
          type="button"
          onClick={onNewGame}
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
