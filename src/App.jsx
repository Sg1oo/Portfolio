import { useState, useEffect } from "react";
import IntroGate from "./components/IntroGate.jsx";
import SceneRenderer from "./components/SceneRenderer.jsx";
import Layout from "./components/Layout.jsx";


export default function App() {
  const [vibe, setVibe] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

   // Auto-advance transition → playful
  useEffect(() => {
    if (vibe === "playful-transition") {
      const timer = setTimeout(() => {
        setShowIntro(false);
    }, 800); 

      return () => clearTimeout(timer);
    }
  }, [vibe]);
  
  const hideBackgroundScene =
    vibe === "playful" ||
    vibe === "playful-transition" ||
    vibe === "playful-door";

  return (
    <Layout hideBackgroundScene={hideBackgroundScene}>
      {showIntro && (
        <IntroGate onSelect={setVibe} fading={vibe === "playful-transition"}/>
      ) } {vibe &&(
        <SceneRenderer vibe={vibe} setVibe={setVibe}/>
      )}
    </Layout>
  );
}
