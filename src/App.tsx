import { useGameState } from "./hooks/useGameState";
import { Setup } from "./components/Setup";
import { ScoreHeader } from "./components/ScoreHeader";
import { RoundForm } from "./components/RoundForm";
import { RoundHistory } from "./components/RoundHistory";
import { PlayerStats } from "./components/PlayerStats";
import { WinnerBanner } from "./components/WinnerBanner";

export default function App() {
  const { state, dispatch } = useGameState();

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
      <div className="max-w-3xl mx-auto px-4 py-10">
        {state.phase === "finished" && (
          <WinnerBanner
            state={state}
            onNewGame={() => dispatch({ type: "NEW_GAME" })}
            onKeepPlaying={() => dispatch({ type: "KEEP_PLAYING" })}
          />
        )}

        <ScoreHeader state={state} onNewGame={() => dispatch({ type: "NEW_GAME" })} />

        {state.phase === "playing" && (
          <RoundForm
            players={state.players}
            onSubmit={(entries) => dispatch({ type: "ADD_ROUND", entries })}
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
