import { forwardRef } from "react";
import type { GameState, PlayerIndex } from "../types";
import { runningTotals, playerStats, playerCumulativeScore } from "../scoring";

interface ExportCardProps {
  state: GameState;
}

const PLAYER_INDICES: PlayerIndex[] = [0, 1, 2, 3];

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(
  ({ state }, ref) => {
    const { players, rounds, scoreLimit } = state;
    const totals = runningTotals(rounds);
    const stats = PLAYER_INDICES.map((i) => playerStats(rounds, i));

    const clampedPct = (total: number): string =>
      `${Math.min(Math.max((total / scoreLimit) * 100, 0), 100)}%`;

    // Pre-compute cumulative totals per round
    let runA = 0;
    let runB = 0;
    const cumulatives = rounds.map((r) => {
      runA += r.teamAScore;
      runB += r.teamBScore;
      return { a: runA, b: runB };
    });

    const roundDisplay =
      state.phase === "playing"
        ? `Round ${rounds.length + 1}`
        : `${rounds.length} Round${rounds.length !== 1 ? "s" : ""} Played`;

    return (
      <div
        ref={ref}
        style={{ width: "600px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
        className="bg-zinc-950 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-white font-bold text-lg">400 Scorekeeper</span>
          <span className="text-zinc-500 text-sm">{roundDisplay}</span>
        </div>

        {/* Team scores */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {(["A", "B"] as const).map((team) => {
            const total = team === "A" ? totals.a : totals.b;
            const p1 = team === "A" ? players[0] : players[2];
            const p2 = team === "A" ? players[1] : players[3];
            const winner = state.winner === team;
            return (
              <div
                key={team}
                className={`bg-zinc-900 rounded-xl p-4 border ${winner ? "border-emerald-500" : "border-zinc-800"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Team {team} {winner && "🏆"}
                </p>
                <p className="text-sm text-zinc-400 mt-0.5">{p1} &amp; {p2}</p>
                <p className="text-4xl font-bold text-white mt-2">{total}</p>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: clampedPct(total) }}
                  />
                </div>
                <p className="text-xs text-zinc-600 text-right mt-1">/ {scoreLimit}</p>
              </div>
            );
          })}
        </div>

        {/* Round history */}
        {rounds.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Round History
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", color: "#71717a", paddingBottom: "6px", fontWeight: 600 }}>#</th>
                  {PLAYER_INDICES.map((i) => (
                    <th key={i} style={{ textAlign: "right", color: "#71717a", paddingBottom: "6px", fontWeight: 600, maxWidth: "60px", overflow: "hidden" }}>
                      {players[i].split(" ")[0]}
                    </th>
                  ))}
                  <th style={{ textAlign: "right", color: "#71717a", paddingBottom: "6px", fontWeight: 600 }}>A Δ</th>
                  <th style={{ textAlign: "right", color: "#71717a", paddingBottom: "6px", fontWeight: 600 }}>B Δ</th>
                  <th style={{ textAlign: "right", color: "#71717a", paddingBottom: "6px", fontWeight: 600 }}>A Σ</th>
                  <th style={{ textAlign: "right", color: "#71717a", paddingBottom: "6px", fontWeight: 600 }}>B Σ</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((round, idx) => {
                  const cum = cumulatives[idx];
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={round.id}
                      style={{ background: isEven ? "transparent" : "rgba(39,39,42,0.4)" }}
                    >
                      <td style={{ color: "#71717a", padding: "4px 4px 4px 0", textAlign: "left" }}>{round.id}</td>
                      {PLAYER_INDICES.map((i) => {
                        const e = round.entries[i];
                        const made = e.obtained >= e.called;
                        return (
                          <td key={i} style={{ textAlign: "right", padding: "4px 2px", color: made ? "#34d399" : "#f87171" }}>
                            {e.called}→{e.obtained}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "right", padding: "4px 2px", color: round.teamAScore > 0 ? "#34d399" : round.teamAScore < 0 ? "#f87171" : "#a1a1aa" }}>
                        {round.teamAScore > 0 ? "+" : ""}{round.teamAScore}
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 2px", color: round.teamBScore > 0 ? "#34d399" : round.teamBScore < 0 ? "#f87171" : "#a1a1aa" }}>
                        {round.teamBScore > 0 ? "+" : ""}{round.teamBScore}
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 2px", color: "#ffffff", fontWeight: 600 }}>{cum.a}</td>
                      <td style={{ textAlign: "right", padding: "4px 2px", color: "#ffffff", fontWeight: 600 }}>{cum.b}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Player stats */}
        {rounds.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {PLAYER_INDICES.map((i) => {
              const s = stats[i];
              const score = playerCumulativeScore(rounds, i);
              const makeRateColor =
                s.makeRate >= 0.7 ? "#34d399" : s.makeRate >= 0.5 ? "#facc15" : "#f87171";
              const scoreColor = score >= 0 ? "#34d399" : "#f87171";
              return (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {players[i]}
                  </p>
                  <p style={{ fontSize: "10px", color: "#52525b", marginBottom: "4px" }}>
                    {i < 2 ? "Team A" : "Team B"}
                  </p>
                  <p style={{ fontSize: "12px", color: scoreColor, fontWeight: 700, marginBottom: "2px" }}>
                    {score >= 0 ? "+" : ""}{score} pts
                  </p>
                  <p style={{ fontSize: "11px", color: makeRateColor, fontWeight: 600 }}>
                    {Math.round(s.makeRate * 100)}%
                  </p>
                  <p style={{ fontSize: "10px", color: "#71717a" }}>
                    {s.avgCalled.toFixed(1)} bid · {s.avgObtained.toFixed(1)} won
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p className="text-zinc-700 text-xs text-center mt-5">
          abassaf.github.io/400-scorekeeper
        </p>
      </div>
    );
  }
);

ExportCard.displayName = "ExportCard";
