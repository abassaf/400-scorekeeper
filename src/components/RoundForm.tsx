import { useState } from "react";
import type { PlayerEntry, PlayerIndex } from "../types";
import { NumberStepper } from "./NumberStepper";

interface RoundFormProps {
  players: [string, string, string, string];
  roundsPlayed: number;
  onSubmit: (entries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry]) => void;
  onUndo: () => void;
}

type FormFields = { [K in PlayerIndex]: PlayerEntry };

const PLAYER_INDICES: PlayerIndex[] = [0, 1, 2, 3];

const emptyFields = (): FormFields => ({
  0: { called: 2, obtained: 0 },
  1: { called: 2, obtained: 0 },
  2: { called: 2, obtained: 0 },
  3: { called: 2, obtained: 0 },
});

export function RoundForm({ players, roundsPlayed, onSubmit, onUndo }: RoundFormProps) {
  const [fields, setFields] = useState<FormFields>(emptyFields);

  function update(index: PlayerIndex, key: keyof PlayerEntry, value: number) {
    setFields((prev) => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
  }

  const calledSum = PLAYER_INDICES.reduce((s, i) => s + fields[i].called, 0);
  const obtainedSum = PLAYER_INDICES.reduce((s, i) => s + fields[i].obtained, 0);
  const canSubmit = calledSum >= 11 && obtainedSum <= 13;

  const bidsColor = calledSum >= 11 ? 'var(--sp-positive)' : 'var(--sp-text-muted)';
  const obtainedColor = obtainedSum > 13 ? 'var(--sp-danger)' : obtainedSum === 13 ? 'var(--sp-positive)' : 'var(--sp-text-muted)';

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(PLAYER_INDICES.map((i) => ({ ...fields[i] })) as [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry]);
    setFields(emptyFields());
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{ backgroundColor: 'var(--sp-card)', border: '1px solid var(--sp-border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--sp-text-subtle)' }}>
        Round Entry
      </p>

      <div className="grid grid-cols-2 gap-4">
        {([{ label: 'Team A', indices: [0, 1] as const, solid: 'var(--sp-team-a-solid)', text: 'var(--sp-team-a-text)' },
           { label: 'Team B', indices: [2, 3] as const, solid: 'var(--sp-team-b-solid)', text: 'var(--sp-team-b-text)' }] as const).map((team) => (
          <div key={team.label}>
            <p className="text-xs font-semibold uppercase tracking-wider text-center mb-3" style={{ color: team.text }}>
              {team.label}
            </p>
            <div className="space-y-3">
              {team.indices.map((i) => (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'var(--sp-bg)', borderLeft: `3px solid ${team.solid}` }}>
                  <p className="text-xs font-medium truncate mb-3" style={{ color: 'var(--sp-text-primary)' }}>
                    {players[i]}
                  </p>
                  <div className="space-y-3">
                    <NumberStepper
                      value={fields[i].called}
                      min={2}
                      max={13}
                      onChange={(v) => update(i, 'called', v)}
                      label="Bid"
                    />
                    <NumberStepper
                      value={fields[i].obtained}
                      min={0}
                      max={13}
                      onChange={(v) => update(i, 'obtained', v)}
                      label="Obtained"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <p className="text-xs" style={{ color: bidsColor }}>
            Bids: {calledSum}{calledSum >= 11 ? ' ✓' : ' (min 11)'}
          </p>
          <p className="text-xs" style={{ color: obtainedColor }}>
            Obtained: {obtainedSum} / 13
          </p>
        </div>
        <div className="flex items-center gap-2">
          {roundsPlayed > 0 && (
            <button
              type="button"
              onClick={onUndo}
              className="text-xs px-3 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-secondary)' }}
            >
              Undo
            </button>
          )}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
          >
            Add Round
          </button>
        </div>
      </div>
    </div>
  );
}
