import { useRef, useState } from "react";
import type { PlayerEntry, PlayerIndex } from "../types";

interface RoundFormProps {
  players: [string, string, string, string];
  onSubmit: (entries: [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry]) => void;
}

type FieldKey = "called" | "obtained";

type FormFields = {
  [K in PlayerIndex]: { called: string; obtained: string };
};

const PLAYER_INDICES: PlayerIndex[] = [0, 1, 2, 3];

const emptyFields = (): FormFields => ({
  0: { called: "", obtained: "" },
  1: { called: "", obtained: "" },
  2: { called: "", obtained: "" },
  3: { called: "", obtained: "" },
});

export function RoundForm({ players, onSubmit }: RoundFormProps) {
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    index: PlayerIndex,
    key: FieldKey,
    value: string
  ): void => {
    setFields((prev) => ({
      ...prev,
      [index]: { ...prev[index], [key]: value },
    }));
  };

  const allFilled = PLAYER_INDICES.every(
    (i) => fields[i].called !== "" && fields[i].obtained !== ""
  );

  const obtainedSum = PLAYER_INDICES.reduce<number>((sum, i) => {
    const val = parseInt(fields[i].obtained, 10);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const tricksColorClass =
    obtainedSum === 13
      ? "text-green-400"
      : obtainedSum > 13
      ? "text-yellow-400"
      : "text-zinc-500";

  const handleSubmit = (): void => {
    if (!allFilled) return;

    const entries = PLAYER_INDICES.map((i) => ({
      called: parseInt(fields[i].called, 10),
      obtained: parseInt(fields[i].obtained, 10),
    })) as [PlayerEntry, PlayerEntry, PlayerEntry, PlayerEntry];

    onSubmit(entries);
    setFields(emptyFields());
    firstInputRef.current?.focus();
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        Round Entry
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLAYER_INDICES.map((i) => {
          const isFirstPlayer = i === 0;
          const teamLabel = i < 2 ? "Team A" : "Team B";

          return (
            <div key={i}>
              <p className="text-xs text-zinc-400 font-medium mb-0.5 truncate">
                {players[i]}
              </p>
              <p className="text-xs text-zinc-600">{teamLabel}</p>

              <p className="text-xs text-zinc-500 mb-1 mt-2">Called</p>
              <input
                ref={isFirstPlayer ? firstInputRef : undefined}
                type="number"
                inputMode="numeric"
                min={1}
                max={13}
                value={fields[i].called}
                onChange={(e) => handleChange(i, "called", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-zinc-500"
              />

              <p className="text-xs text-zinc-500 mb-1 mt-2">Obtained</p>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={13}
                value={fields[i].obtained}
                onChange={(e) => handleChange(i, "obtained", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className={`text-xs ${tricksColorClass}`}>
          Tricks: {obtainedSum} / 13
        </p>
        <button
          type="button"
          disabled={!allFilled}
          onClick={handleSubmit}
          className="bg-white text-zinc-950 font-semibold px-6 py-2 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add Round
        </button>
      </div>
    </div>
  );
}
