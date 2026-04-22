import { useRef, useState } from "react";
import { useGameState } from "./hooks/useGameState";
import { useExport } from "./hooks/useExport";
import { useTheme } from "./context/ThemeContext";
import { Setup } from "./components/Setup";
import { ScoreHeader } from "./components/ScoreHeader";
import { RoundForm } from "./components/RoundForm";
import { RoundHistory } from "./components/RoundHistory";
import { PlayerStats } from "./components/PlayerStats";
import { WinnerBanner } from "./components/WinnerBanner";
import { ExportCard } from "./components/ExportCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { Dialog } from "./components/Dialog";

export default function App() {
  const { state, dispatch } = useGameState();
  const { colors } = useTheme();
  const exportCardRef = useRef<HTMLDivElement>(null);
  const { exportImage, exporting } = useExport(exportCardRef);
  const [showNewGamePrompt, setShowNewGamePrompt] = useState(false);

  const cssVars = {
    '--sp-bg': colors.bg,
    '--sp-card': colors.card,
    '--sp-border': colors.border,
    '--sp-border-muted': colors.borderMuted,
    '--sp-text-primary': colors.textPrimary,
    '--sp-text-secondary': colors.textSecondary,
    '--sp-text-subtle': colors.textSubtle,
    '--sp-text-muted': colors.textMuted,
    '--sp-positive': colors.positive,
    '--sp-danger': colors.danger,
    '--sp-danger-bg': colors.dangerBg,
    '--sp-accent': colors.accent,
    '--sp-accent-text': colors.accentText,
    '--sp-progress-track': colors.progressTrack,
    '--sp-table-row-alt': colors.tableRowAlt,
    '--sp-team-a-bg': colors.teamA.bg,
    '--sp-team-a-border': colors.teamA.border,
    '--sp-team-a-solid': colors.teamA.solid,
    '--sp-team-a-text': colors.teamA.text,
    '--sp-team-b-bg': colors.teamB.bg,
    '--sp-team-b-border': colors.teamB.border,
    '--sp-team-b-solid': colors.teamB.solid,
    '--sp-team-b-text': colors.teamB.text,
  } as React.CSSProperties;

  function handleNewGame() {
    if (state.phase === 'playing' && state.rounds.length > 0) {
      setShowNewGamePrompt(true);
    } else {
      dispatch({ type: 'NEW_GAME' });
    }
  }

  if (state.phase === "setup") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ ...cssVars, backgroundColor: colors.bg, color: colors.textPrimary }}
      >
        <div className="w-full max-w-lg">
          <Setup
            onStart={(players, scoreLimit) =>
              dispatch({ type: "START_GAME", players, scoreLimit })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ ...cssVars, backgroundColor: colors.bg, color: colors.textPrimary }}
    >
      <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1, pointerEvents: "none" }}>
        <ExportCard ref={exportCardRef} state={state} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <SettingsPanel dispatch={dispatch} />

        {state.phase === "finished" && (
          <WinnerBanner
            state={state}
            onNewGame={handleNewGame}
            onKeepPlaying={() => dispatch({ type: "KEEP_PLAYING" })}
          />
        )}

        <ScoreHeader
          state={state}
          onNewGame={handleNewGame}
          onExport={exportImage}
          exporting={exporting}
        />

        {state.phase === "playing" && (
          <RoundForm
            players={state.players}
            roundsPlayed={state.rounds.length}
            onSubmit={(entries) => dispatch({ type: "ADD_ROUND", entries })}
            onUndo={() => dispatch({ type: "UNDO_ROUND" })}
          />
        )}

        {state.rounds.length > 0 && (
          <>
            <RoundHistory state={state} dispatch={dispatch} />
            <PlayerStats state={state} />
          </>
        )}
      </div>

      <Dialog
        open={showNewGamePrompt}
        onClose={() => setShowNewGamePrompt(false)}
        title="New Game"
      >
        <p className="text-sm mb-5" style={{ color: 'var(--sp-text-secondary)' }}>
          You have an in-progress game. Discard it and start fresh?
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { dispatch({ type: 'NEW_GAME' }); setShowNewGamePrompt(false); }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--sp-danger)', color: '#ffffff' }}
          >
            Discard &amp; New Game
          </button>
          <button
            type="button"
            onClick={() => setShowNewGamePrompt(false)}
            className="w-full py-2.5 rounded-xl text-sm transition-colors"
            style={{ backgroundColor: 'var(--sp-border)', color: 'var(--sp-text-secondary)' }}
          >
            Cancel
          </button>
        </div>
      </Dialog>
    </div>
  );
}
