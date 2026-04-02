import { useState } from "react";

interface SetupProps {
  onStart: (players: [string, string, string, string], scoreLimit: number) => void;
}

const DEFAULTS: [string, string, string, string] = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
];

export function Setup({ onStart }: SetupProps) {
  const [names, setNames] = useState<[string, string, string, string]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
  ]);
  const [scoreLimit, setScoreLimit] = useState<number>(80);

  function updateName(index: 0 | 1 | 2 | 3, value: string): void {
    const next: [string, string, string, string] = [...names] as [
      string,
      string,
      string,
      string,
    ];
    next[index] = value;
    setNames(next);
  }

  function handleStart(): void {
    const resolved: [string, string, string, string] = names.map(
      (name, i) => name.trim() || DEFAULTS[i],
    ) as [string, string, string, string];
    onStart(resolved, scoreLimit);
  }

  const [scoreLimitRaw, setScoreLimitRaw] = useState<string>(String(scoreLimit));
  const scoreLimitInvalid = parseInt(scoreLimitRaw, 10) < 40 || isNaN(parseInt(scoreLimitRaw, 10));

  function handleScoreLimit(value: string): void {
    setScoreLimitRaw(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setScoreLimit(parsed);
    }
  }

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">400 Scorekeeper</h1>
          <p className="text-zinc-400">Set up your game</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Team A */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Team A
            </p>
            <div className="space-y-3">
              {([0, 1] as const).map((i) => (
                <div key={i}>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Player {i + 1}
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={names[i]}
                    placeholder={DEFAULTS[i]}
                    onChange={(e) => updateName(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team B */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
              Team B
            </p>
            <div className="space-y-3">
              {([2, 3] as const).map((i) => (
                <div key={i}>
                  <label className="block text-sm text-zinc-400 mb-1">
                    Player {i - 1}
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={names[i]}
                    placeholder={DEFAULTS[i]}
                    onChange={(e) => updateName(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Limit */}
        <div className="mb-2">
          <label className="block text-sm text-zinc-400 mb-1">Score Limit</label>
          <input
            type="text"
            inputMode="numeric"
            className={`${inputClass} w-32 ${scoreLimitInvalid ? "border-red-500 focus:border-red-500" : ""}`}
            value={scoreLimitRaw}
            onChange={(e) => handleScoreLimit(e.target.value)}
          />
          {scoreLimitInvalid ? (
            <p className="text-xs text-red-400 mt-1">Must be 40 or higher</p>
          ) : (
            <p className="text-xs text-zinc-500 mt-1">First team to reach this score wins</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={scoreLimitInvalid}
          className="w-full mt-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Start Game
        </button>
    </div>
  );
}
