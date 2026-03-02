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
  

 const handleComplete = useCallback(() => {
  setVibe("playful-door");
 }, [setVibe]);
 

  if (vibe === "playful-transition") {
     
    return (
      <div style={{ position: "relative" }}>
        <PlayfulTransitionScene onComplete={handleComplete} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 }}>
          <PlayfulDoorScene />
        </div>
      </div>
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
