import { GameState, PlayerIndex } from "../types";
import { playerStats, runningTotals, playerCumulativeScore } from "../scoring";

interface PlayerStatsProps {
  state: GameState;
}

const PLAYER_INDICES: PlayerIndex[] = [0, 1, 2, 3];

export function PlayerStats({ state }: PlayerStatsProps) {
  const { rounds, players } = state;
  const totals = runningTotals(rounds);

  function makeRateColor(rate: number): string {
    if (rate >= 0.7) return 'var(--sp-positive)';
    if (rate >= 0.5) return 'var(--sp-text-primary)';
    return 'var(--sp-danger)';
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--sp-text-subtle)' }}>
        Player Stats
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {PLAYER_INDICES.map((idx) => {
          const s = playerStats(rounds, idx);
          const score = playerCumulativeScore(rounds, idx);
          const teamLabel = idx < 2 ? "Team A" : "Team B";
          const teamSolid = idx < 2 ? 'var(--sp-team-a-solid)' : 'var(--sp-team-b-solid)';
          return (
            <div
              key={idx}
              className="rounded-lg p-3"
              style={{ backgroundColor: 'var(--sp-border)', borderLeft: `3px solid ${teamSolid}` }}
            >
              <p className="text-sm font-medium truncate" style={{ color: 'var(--sp-text-primary)' }}>
                {players[idx]}
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--sp-text-subtle)' }}>{teamLabel}</p>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: 'var(--sp-text-muted)' }}>Score</span>
                <span className="text-xs font-semibold"
                  style={{ color: score >= 0 ? 'var(--sp-positive)' : 'var(--sp-danger)' }}>
                  {score >= 0 ? "+" : ""}{score}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: 'var(--sp-text-muted)' }}>Make Rate</span>
                <span className="text-xs font-medium" style={{ color: makeRateColor(s.makeRate) }}>
                  {Math.round(s.makeRate * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs" style={{ color: 'var(--sp-text-muted)' }}>Avg Called</span>
                <span className="text-xs font-medium" style={{ color: 'var(--sp-text-secondary)' }}>
                  {s.avgCalled.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--sp-text-muted)' }}>Avg Obtained</span>
                <span className="text-xs font-medium" style={{ color: 'var(--sp-text-secondary)' }}>
                  {s.avgObtained.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--sp-border)' }}>
        <span className="text-sm" style={{ color: 'var(--sp-text-secondary)' }}>
          Team A Total: <span style={{ color: 'var(--sp-team-a-solid)', fontWeight: 600 }}>{totals.a} pts</span>
        </span>
        <span className="text-sm" style={{ color: 'var(--sp-text-secondary)' }}>
          Team B Total: <span style={{ color: 'var(--sp-team-b-solid)', fontWeight: 600 }}>{totals.b} pts</span>
        </span>
      </div>
    </div>
  );
}
