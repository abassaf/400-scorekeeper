import { useState } from "react";
import type { GameState, Round } from "../types";
import type { GameAction } from "../hooks/useGameState";
import { EditRoundModal } from "./EditRoundModal";

interface RoundHistoryProps {
  state: GameState;
  dispatch?: React.Dispatch<GameAction>;
}

function scoreColor(score: number): string {
  if (score > 0) return 'var(--sp-positive)';
  if (score < 0) return 'var(--sp-danger)';
  return 'var(--sp-text-secondary)';
}

function formatDelta(score: number): string {
  return score > 0 ? `+${score}` : `${score}`;
}

export function RoundHistory({ state, dispatch }: RoundHistoryProps) {
  const { rounds, players } = state;
  const [editingRound, setEditingRound] = useState<Round | null>(null);

  const cumulatives: { aTotal: number; bTotal: number }[] = [];
  let runningA = 0;
  let runningB = 0;
  for (const round of rounds) {
    runningA += round.teamAScore;
    runningB += round.teamBScore;
    cumulatives.push({ aTotal: runningA, bTotal: runningB });
  }

  const displayRows = rounds
    .map((round, idx) => ({ round, aTotal: cumulatives[idx].aTotal, bTotal: cumulatives[idx].bTotal }))
    .reverse();

  if (rounds.length === 0) return null;

  return (
    <>
      <div
        className="rounded-xl p-6 mb-6"
        style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--sp-text-subtle)' }}>
          Round History
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-xs uppercase pb-2 text-left pr-3"
                  style={{ color: 'var(--sp-text-subtle)', borderBottom: '1px solid var(--sp-border)' }}>
                  #
                </th>
                {players.map((name, i) => (
                  <th key={i} className="text-xs uppercase pb-2 text-right px-2"
                    style={{ color: 'var(--sp-text-subtle)', borderBottom: '1px solid var(--sp-border)' }}>
                    {name}
                  </th>
                ))}
                {['Team A Δ', 'Team B Δ', 'Team A Σ', 'Team B Σ'].map((h) => (
                  <th key={h} className="text-xs uppercase pb-2 text-right px-2"
                    style={{ color: 'var(--sp-text-subtle)', borderBottom: '1px solid var(--sp-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map(({ round, aTotal, bTotal }, rowIdx) => {
                const isEven = rowIdx % 2 === 0;
                const clickable = !!dispatch;
                return (
                  <tr
                    key={round.id}
                    onClick={clickable ? () => setEditingRound(round) : undefined}
                    style={{
                      backgroundColor: isEven ? 'transparent' : 'var(--sp-table-row-alt)',
                      cursor: clickable ? 'pointer' : 'default',
                      borderBottom: '1px solid var(--sp-border)',
                    }}
                    className={clickable ? 'hover:opacity-80 transition-opacity' : ''}
                  >
                    <td className="text-left pr-3 py-2" style={{ color: 'var(--sp-text-muted)' }}>
                      <span className="flex items-center gap-1">
                        {round.comment && (
                          <span
                            title={round.comment}
                            style={{ color: 'var(--sp-positive)', fontSize: 8 }}
                          >●</span>
                        )}
                        {round.id}
                      </span>
                    </td>
                    {round.entries.map((entry, i) => (
                      <td key={i} className="text-right px-2 py-2"
                        style={{ color: entry.obtained >= entry.called ? 'var(--sp-positive)' : 'var(--sp-danger)' }}>
                        <span>&#9679;</span> {entry.called}&rarr;{entry.obtained}
                      </td>
                    ))}
                    <td className="text-right px-2 py-2" style={{ color: scoreColor(round.teamAScore) }}>
                      {formatDelta(round.teamAScore)}
                    </td>
                    <td className="text-right px-2 py-2" style={{ color: scoreColor(round.teamBScore) }}>
                      {formatDelta(round.teamBScore)}
                    </td>
                    <td className="text-right px-2 py-2 font-semibold"
                      style={{ color: 'var(--sp-text-primary)' }}>
                      {aTotal}
                    </td>
                    <td className="text-right pl-2 py-2 font-semibold"
                      style={{ color: 'var(--sp-text-primary)' }}>
                      {bTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dispatch && (
        <EditRoundModal
          open={editingRound !== null}
          round={editingRound}
          players={state.players}
          onSave={(roundId, entries, comment) => {
            dispatch({ type: 'EDIT_ROUND', roundId, entries, comment: comment || undefined });
            setEditingRound(null);
          }}
          onClose={() => setEditingRound(null)}
        />
      )}
    </>
  );
}
