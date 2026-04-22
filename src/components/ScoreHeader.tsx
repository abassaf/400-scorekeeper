import { useState } from "react";
import { runningTotals, playerCumulativeScore } from "../scoring";
import { stateToShareUrl } from "../hooks/useGameState";
import type { GameState } from "../types";

interface ScoreHeaderProps {
  state: GameState;
  onNewGame: () => void;
  onExport: () => void;
  exporting: boolean;
  onSave?: () => void;
  saveLabel?: string;
}

export function ScoreHeader({ state, onNewGame, onExport, exporting, onSave, saveLabel = 'Save' }: ScoreHeaderProps) {
  const [copied, setCopied] = useState(false);
  const totals = runningTotals(state.rounds);
  const { scoreLimit, players, phase, rounds } = state;

  function handleShare(): void {
    const url = stateToShareUrl(state);
    const finish = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(finish).catch(() => fallbackCopy(url, finish));
    } else {
      fallbackCopy(url, finish);
    }
  }

  function fallbackCopy(text: string, onSuccess: () => void): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    if (document.execCommand('copy')) onSuccess();
    document.body.removeChild(ta);
  }

  const aBlocked =
    totals.a >= scoreLimit &&
    ([0, 1] as const).some((i) => playerCumulativeScore(rounds, i) < 0);
  const bBlocked =
    totals.b >= scoreLimit &&
    ([2, 3] as const).some((i) => playerCumulativeScore(rounds, i) < 0);

  const roundDisplay =
    phase === "playing"
      ? `Round ${rounds.length + 1}`
      : `${rounds.length} Round${rounds.length !== 1 ? "s" : ""} Played`;

  const clampedPct = (total: number): string => {
    if (scoreLimit <= 0) return "0%";
    return `${Math.min(Math.max((total / scoreLimit) * 100, 0), 100)}%`;
  };

  const teams = [
    {
      label: 'A',
      total: totals.a,
      p1: players[0],
      p2: players[1],
      blocked: aBlocked,
      bgVar: 'var(--sp-team-a-bg)',
      borderVar: aBlocked ? 'var(--sp-danger)' : 'var(--sp-team-a-border)',
      solidVar: 'var(--sp-team-a-solid)',
      textVar: 'var(--sp-team-a-text)',
    },
    {
      label: 'B',
      total: totals.b,
      p1: players[2],
      p2: players[3],
      blocked: bBlocked,
      bgVar: 'var(--sp-team-b-bg)',
      borderVar: bBlocked ? 'var(--sp-danger)' : 'var(--sp-team-b-border)',
      solidVar: 'var(--sp-team-b-solid)',
      textVar: 'var(--sp-team-b-text)',
    },
  ] as const;

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
    >
      <div className="grid grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.label}>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: team.textVar }}>
                Team {team.label}
              </p>
              {team.blocked && (
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--sp-danger)', backgroundColor: 'var(--sp-danger-bg)' }}
                >
                  Blocked
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--sp-text-secondary)' }}>
              {team.p1} &amp; {team.p2}
            </p>
            <p className="text-4xl font-bold mt-2" style={{ color: 'var(--sp-text-primary)' }}>
              {team.total}
            </p>
            <div
              className="mt-3 h-2 rounded-full relative overflow-hidden"
              style={{ backgroundColor: 'var(--sp-progress-track)' }}
            >
              <div
                className="h-2 rounded-full absolute inset-y-0 left-0"
                style={{
                  width: clampedPct(team.total),
                  backgroundColor: team.solidVar,
                  transition: 'width 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
            {scoreLimit > 0 && (
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--sp-text-muted)' }}>
                / {scoreLimit}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm" style={{ color: 'var(--sp-text-subtle)' }}>{roundDisplay}</p>
        <div className="flex items-center gap-2">
          {onSave && state.phase === 'playing' && state.rounds.length > 0 && (
            <button
              type="button"
              onClick={onSave}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-team-a-text)' }}
            >
              {saveLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-secondary)' }}
          >
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-secondary)' }}
          >
            {exporting ? "Saving…" : "Export"}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-secondary)' }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
