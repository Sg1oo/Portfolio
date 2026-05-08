import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function SceneController({ phase, progress }) {
  const autoEnterRef = useRef(false);

  useFrame(({ camera }) => {
    if (phase === "ready" && !autoEnterRef.current) {
      autoEnterRef.current = true;
    }
    if (phase === "entering") {
      camera.position.z -= 0.05 * (1 - progress * 0.5);
    }
  });

  return null;
}