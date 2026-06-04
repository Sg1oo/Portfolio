import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function AmbientPulse() {
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!lightRef.current) return;

    lightRef.current.intensity =
      1.5 + Math.sin(clock.elapsedTime * 0.2) * 0.3;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 2, -4]}
      intensity={2}
      color="#a78bfa"
    />
  );
}