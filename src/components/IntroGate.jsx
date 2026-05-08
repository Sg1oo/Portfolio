import { useEffect, useState } from "react";

export default function IntroGate({ onSelect, fading }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transform: fading ? "scale(0.98)" : "scale(1)",
        transition: "opacity 1.2s ease, transform 1.2s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="intro-gate">
        {step >= 1 && <h1 className="intro-title">Welcome.</h1>}

        {step >= 2 && (
          <p className="intro-question">How are you feeling today?</p>
        )}

        {step >= 3 && (
          <div className="intro-options">
            <button onClick={() => onSelect("curious")}>Curious</button>
            <button onClick={() => onSelect("playful-transition")}>
              Playful
            </button>
            <button onClick={() => onSelect("philosophical")}>
              Thoughtful
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
