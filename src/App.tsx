import { useRef } from "react";
import { useGameState } from "./hooks/useGameState";
import { useExport } from "./hooks/useExport";
import { Setup } from "./components/Setup";
import { ScoreHeader } from "./components/ScoreHeader";
import { RoundForm } from "./components/RoundForm";
import { RoundHistory } from "./components/RoundHistory";
import { PlayerStats } from "./components/PlayerStats";
import { WinnerBanner } from "./components/WinnerBanner";
import { ExportCard } from "./components/ExportCard";

export default function App() {
  const { state, dispatch } = useGameState();
  const exportCardRef = useRef<HTMLDivElement>(null);
  const { exportImage, exporting } = useExport(exportCardRef);

  if (state.phase === "setup") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Off-screen export card — must be in DOM for html-to-image */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1, pointerEvents: "none" }}>
        <ExportCard ref={exportCardRef} state={state} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {state.phase === "finished" && (
          <WinnerBanner
            state={state}
            onNewGame={() => dispatch({ type: "NEW_GAME" })}
            onKeepPlaying={() => dispatch({ type: "KEEP_PLAYING" })}
          />
        )}

        <ScoreHeader
          state={state}
          onNewGame={() => dispatch({ type: "NEW_GAME" })}
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
            <RoundHistory state={state} />
            <PlayerStats state={state} />
          </>
        )}
      </div>
    </div>
  );
}
