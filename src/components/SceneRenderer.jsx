import Curious from "../scenes/Curious.jsx";
import Playful from "../scenes/Playful.jsx";
import Philosophical from "../scenes/Philosophical.jsx";
import Neutral from "../scenes/Neutral.jsx";
import PlayfulTransitionScene from "../scenes/PlayfulTransitionScene.jsx";
import PlayfulDoorScene from "../scenes/PlayfulDoorScene.jsx";
import { useCallback } from "react";

const SCENES = {
  curious: Curious,
  playful: PlayfulDoorScene,
  philosophical: Philosophical,
};

export default function SceneRenderer({ vibe, setVibe }) {
  const Scene = SCENES[vibe] || Neutral; 
  const handleComplete = useCallback(() => { setVibe("playful-door"); }, [setVibe]);
  if (vibe === "playful-transition") {
    return (
      <>
        <PlayfulDoorScene /> {/* Mount immediately underneath */}
        <PlayfulTransitionScene
          onComplete={handleComplete}
        />
      </>
    );
  }


  if (vibe === "playful-door") {
    return <PlayfulDoorScene />;
  }


  return (
    <div className="scene-container">
      <Scene />
    </div>
  );
}
