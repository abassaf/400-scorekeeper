import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { NumberStepper } from './NumberStepper';
import type { Round, PlayerEntry } from '../types';

interface EditRoundModalProps {
  open: boolean;
  round: Round | null;
  players: [string, string, string, string];
  onSave: (roundId: number, entries: Round['entries'], comment: string) => void;
  onClose: () => void;
}

type Entries = [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry];

export function EditRoundModal({ open, round, players, onSave, onClose }: EditRoundModalProps) {
  const [entries, setEntries] = useState<Entries>([
    { called: 2, obtained: 0 },
    { called: 2, obtained: 0 },
    { called: 2, obtained: 0 },
    { called: 2, obtained: 0 },
  ]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (round && open) {
      setEntries([
        { ...round.entries[0] },
        { ...round.entries[1] },
        { ...round.entries[2] },
        { ...round.entries[3] },
      ]);
      setComment(round.comment ?? '');
    }
  }, [round, open]);

  if (!round) return null;

  function updateEntry(index: 0 | 1 | 2 | 3, field: keyof PlayerEntry, value: number) {
    const next: Entries = [{ ...entries[0] }, { ...entries[1] }, { ...entries[2] }, { ...entries[3] }];
    next[index] = { ...next[index], [field]: value };
    setEntries(next);
  }

  const calledSum = entries.reduce((s, e) => s + e.called, 0);
  const obtainedSum = entries.reduce((s, e) => s + e.obtained, 0);
  const canSubmit = calledSum >= 11 && obtainedSum <= 13;

  const validationColor = !canSubmit ? 'var(--sp-danger)' : 'var(--sp-positive)';
  const validationText = calledSum < 11
    ? `Bids too low: ${calledSum} (min 11)`
    : obtainedSum > 13
    ? `Tricks too high: ${obtainedSum} (max 13)`
    : `Bids: ${calledSum} · Tricks: ${obtainedSum}`;

  function handleSave() {
    if (!round || !canSubmit) return;
    onSave(round.id, entries, comment);
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Edit Round ${round.id}`}>
      <div className="grid grid-cols-2 gap-4 mb-3">
        {(['A', 'B'] as const).map((team) => {
          const indices = team === 'A' ? ([0, 1] as const) : ([2, 3] as const);
          return (
            <div key={team}>
              <p
                className="text-xs font-semibold uppercase tracking-wider text-center mb-3"
                style={{ color: team === 'A' ? 'var(--sp-team-a-text)' : 'var(--sp-team-b-text)' }}
              >
                Team {team}
              </p>
              {indices.map((i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs text-center truncate mb-2"
                    style={{ color: 'var(--sp-text-secondary)' }}>
                    {players[i]}
                  </p>
                  <NumberStepper
                    value={entries[i].called}
                    min={2}
                    max={13}
                    onChange={(v) => updateEntry(i, 'called', v)}
                    label="Bid"
                  />
                  <div className="mt-2">
                    <NumberStepper
                      value={entries[i].obtained}
                      min={0}
                      max={13}
                      onChange={(v) => updateEntry(i, 'obtained', v)}
                      label="Tricks"
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center font-semibold mb-3" style={{ color: validationColor }}>
        {validationText}
      </p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 200))}
        placeholder="Add a note for this round…"
        maxLength={200}
        rows={2}
        className="w-full rounded-lg px-3 py-2 text-sm mb-4 resize-none focus:outline-none"
        style={{
          backgroundColor: 'var(--sp-bg)',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-text-primary)',
        }}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
      >
        Save
      </button>
    </Dialog>
  );
}
