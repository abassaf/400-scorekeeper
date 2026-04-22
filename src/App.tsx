import { useRef, useState, useEffect } from "react";
import { useGameState } from "./hooks/useGameState";
import { useExport } from "./hooks/useExport";
import { useTheme } from "./context/ThemeContext";
import { useGameHistory, type HistoryEntry } from "./hooks/useGameHistory";
import { Setup } from "./components/Setup";
import { ScoreHeader } from "./components/ScoreHeader";
import { RoundForm } from "./components/RoundForm";
import { RoundHistory } from "./components/RoundHistory";
import { PlayerStats } from "./components/PlayerStats";
import { WinnerBanner } from "./components/WinnerBanner";
import { ExportCard } from "./components/ExportCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { Dialog } from "./components/Dialog";
import { TabBar, type AppView } from "./components/TabBar";
import { HistoryList } from "./components/HistoryList";
import { HistoryDetail } from "./components/HistoryDetail";

export default function App() {
  const { state, dispatch } = useGameState();
  const { colors } = useTheme();
  const exportCardRef = useRef<HTMLDivElement>(null);
  const { exportImage, exporting } = useExport(exportCardRef);
  const { history, saveGame, updateGame, deleteGame, clearAll } = useGameHistory();
  const [showNewGamePrompt, setShowNewGamePrompt] = useState(false);
  const [view, setView] = useState<AppView>('game');
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [pendingLoadEntry, setPendingLoadEntry] = useState<HistoryEntry | null>(null);

  const savedIdRef = useRef<string | null>(null);
  const wasSavedRef = useRef(false);

  useEffect(() => {
    if (state.phase === 'finished') {
      if (savedIdRef.current) {
        // Already saved (auto or manual) — just update
        updateGame(savedIdRef.current, state);
      } else if (!wasSavedRef.current) {
        // First time reaching finished and not yet saved
        wasSavedRef.current = true;
        const id = saveGame(state);
        if (id) savedIdRef.current = id;
      }
    }
    if (state.phase !== 'finished') {
      wasSavedRef.current = false;
      savedIdRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const [saveLabel, setSaveLabel] = useState('Save');
  function handleManualSave() {
    if (savedIdRef.current) {
      updateGame(savedIdRef.current, state);
    } else {
      const id = saveGame(state);
      if (id) savedIdRef.current = id;
    }
    setSaveLabel('Saved!');
    setTimeout(() => setSaveLabel('Save'), 2000);
  }

  function handleNewGame() {
    if (state.phase === 'playing' && state.rounds.length > 0) {
      setShowNewGamePrompt(true);
    } else {
      dispatch({ type: 'NEW_GAME' });
    }
  }

  function handleSaveAndNew() {
    saveGame(state);
    dispatch({ type: 'NEW_GAME' });
    setShowNewGamePrompt(false);
  }

  function doLoad(entry: HistoryEntry) {
    dispatch({ type: 'LOAD_STATE', state: {
      phase: entry.winner === null ? 'playing' : 'finished',
      players: entry.players,
      scoreLimit: entry.scoreLimit,
      rounds: entry.rounds,
      winner: entry.winner,
    }});
    setSelectedEntry(null);
    setView('game');
  }

  function handleLoadIntoGame(entry: HistoryEntry) {
    if (state.phase === 'playing' && state.rounds.length > 0) {
      setPendingLoadEntry(entry);
    } else {
      doLoad(entry);
    }
  }

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

  return (
    <div
      className="min-h-screen"
      style={{ ...cssVars, backgroundColor: colors.bg, color: colors.textPrimary }}
    >
      {state.phase !== "setup" && (
        <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1, pointerEvents: "none" }}>
          <ExportCard ref={exportCardRef} state={state} />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <SettingsPanel dispatch={dispatch} />

        <TabBar
          view={view}
          onSelect={(v) => { setView(v); setSelectedEntry(null); }}
          historyCount={history.length}
        />

        {view === 'history' && selectedEntry && (
          <HistoryDetail
            entry={selectedEntry}
            onBack={() => setSelectedEntry(null)}
            onLoadIntoGame={() => handleLoadIntoGame(selectedEntry)}
          />
        )}

        {view === 'history' && !selectedEntry && (
          <HistoryList
            history={history}
            onSelect={(entry) => setSelectedEntry(entry)}
            onDelete={deleteGame}
            onClearAll={clearAll}
          />
        )}

        {view === 'game' && state.phase === "setup" && (
          <div className="flex items-center justify-center py-8">
            <div className="w-full max-w-lg">
              <Setup
                onStart={(players, scoreLimit) =>
                  dispatch({ type: "START_GAME", players, scoreLimit })
                }
              />
            </div>
          </div>
        )}

        {view === 'game' && state.phase !== "setup" && (
          <>
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
              onSave={handleManualSave}
              saveLabel={saveLabel}
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
          </>
        )}
      </div>

      <Dialog
        open={showNewGamePrompt}
        onClose={() => setShowNewGamePrompt(false)}
        title="New Game"
      >
        <p className="text-sm mb-5" style={{ color: 'var(--sp-text-secondary)' }}>
          You have an in-progress game. What would you like to do?
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSaveAndNew}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
          >
            Save &amp; New Game
          </button>
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
      <Dialog
        open={pendingLoadEntry !== null}
        onClose={() => setPendingLoadEntry(null)}
        title="Load Game"
      >
        <p className="text-sm mb-5" style={{ color: 'var(--sp-text-secondary)' }}>
          You have an in-progress game. What would you like to do?
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { saveGame(state); doLoad(pendingLoadEntry!); setPendingLoadEntry(null); }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
          >
            Save &amp; Continue
          </button>
          <button
            type="button"
            onClick={() => { doLoad(pendingLoadEntry!); setPendingLoadEntry(null); }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--sp-danger)', color: '#ffffff' }}
          >
            Discard &amp; Continue
          </button>
          <button
            type="button"
            onClick={() => setPendingLoadEntry(null)}
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
