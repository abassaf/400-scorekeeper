import { useState } from "react";
import { runningTotals } from "../scoring";
import { stateToShareUrl } from "../hooks/useGameState";
import type { GameState } from "../types";

interface ScoreHeaderProps {
  state: GameState;
  onNewGame: () => void;
  onExport: () => void;
  exporting: boolean;
}

export function ScoreHeader({ state, onNewGame, onExport, exporting }: ScoreHeaderProps) {
  const [copied, setCopied] = useState(false);
  const totals = runningTotals(state.rounds);

  function handleShare(): void {
    const url = stateToShareUrl(state);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  }
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? "Saving…" : "Export"}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
