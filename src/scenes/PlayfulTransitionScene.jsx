import { useEffect, useState } from "react";

export default function PlayfulTransitionScene({ onComplete }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // start fade immediately
    const fadeTimer = setTimeout(() => {
      setOpacity(1);
    }, 50);

    // after fade finishes, move to next scene
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        opacity,
        transition: "opacity 2.5s ease",
        zIndex: 10,
      }}
    />
  );
}