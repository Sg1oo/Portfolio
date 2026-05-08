import { useEffect, useState } from "react";

export default function PlayfulTransitionScene({ onComplete }) {
  const [opacity, setOpacity] = useState(0); // start transparent

  useEffect(() => {
    // Fade IN to black
    const fadeIn = setTimeout(() => {
      setOpacity(1);
    }, 1500);

    // After holding in black, fade OUT
    const fadeOut = setTimeout(() => {
      setOpacity(0);
    }, 2500);

    // After fade out completes, switch scene
    const complete = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, rgba(0,0,0,0.7), black 70%)",
        opacity,
        transition: "opacity 1.8s cubic-bezier(0.77, 0, 0.175, 1)",
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
}