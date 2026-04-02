import type { GameState, Round } from "../types";

interface RoundHistoryProps {
  state: GameState;
}

function scoreColor(score: number): string {
  if (score > 0) return "text-emerald-400";
  if (score < 0) return "text-red-400";
  return "text-zinc-400";
}

function formatDelta(score: number): string {
  if (score > 0) return `+${score}`;
  return `${score}`;
}

function dotColor(entry: { called: number; obtained: number }): string {
  return entry.obtained >= entry.called ? "text-emerald-400" : "text-red-400";
}

export function RoundHistory({ state }: RoundHistoryProps) {
  const { rounds, players } = state;

  // Pre-compute running totals in forward order, indexed by round index (0-based)
  const cumulatives: { aTotal: number; bTotal: number }[] = [];
  let runningA = 0;
  let runningB = 0;
  for (const round of rounds) {
    runningA += round.teamAScore;
    runningB += round.teamBScore;
    cumulatives.push({ aTotal: runningA, bTotal: runningB });
  }

  // Build display rows: each round paired with its cumulative totals
  const rows: { round: Round; aTotal: number; bTotal: number }[] = rounds.map(
    (round, idx) => ({
      round,
      aTotal: cumulatives[idx].aTotal,
      bTotal: cumulatives[idx].bTotal,
    })
  );

  // Reverse so newest round appears first
  const displayRows = [...rows].reverse();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        Round History
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-left pr-3">
                #
              </th>
              {players.map((name, i) => (
                <th
                  key={i}
                  className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-right px-2"
                >
                  {name}
                </th>
              ))}
              <th className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-right px-2">
                Team A &Delta;
              </th>
              <th className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-right px-2">
                Team B &Delta;
              </th>
              <th className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-right px-2">
                Team A &Sigma;
              </th>
              <th className="text-xs text-zinc-500 uppercase pb-2 border-b border-zinc-800 text-right pl-2">
                Team B &Sigma;
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(({ round, aTotal, bTotal }, rowIdx) => {
              const isEven = rowIdx % 2 === 0;
              const rowBg = isEven ? "bg-zinc-900" : "bg-zinc-800/30";
              return (
                <tr
                  key={round.id}
                  className={`${rowBg} border-b border-zinc-800/50`}
                >
                  <td className="text-zinc-500 text-left pr-3 py-2">
                    {round.id}
                  </td>
                  {round.entries.map((entry, i) => (
                    <td key={i} className="text-right px-2 py-2 text-zinc-300">
                      <span className={dotColor(entry)}>&#9679;</span>{" "}
                      {entry.called}&rarr;{entry.obtained}
                    </td>
                  ))}
                  <td
                    className={`text-right px-2 py-2 ${scoreColor(round.teamAScore)}`}
                  >
                    {formatDelta(round.teamAScore)}
                  </td>
                  <td
                    className={`text-right px-2 py-2 ${scoreColor(round.teamBScore)}`}
                  >
                    {formatDelta(round.teamBScore)}
                  </td>
                  <td className="text-white font-semibold text-right px-2 py-2">
                    {aTotal}
                  </td>
                  <td className="text-white font-semibold text-right pl-2 py-2">
                    {bTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
