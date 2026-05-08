import * as THREE from "three";
import { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { DOOR_CONFIGS } from "../data/doorConfigs";
import { getDoorTransform } from "../utils/getDoorPosition";
import Door from "../components/Door";
import HallwayCamera from "../components/HallwayCamera";
import { Html } from "@react-three/drei";

function ResetCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, -5);
  }, [camera]);

  return null;
}

export default function HallwayScene() {
  const [hovered, setHovered] = useState(null);
  console.log("HallwayScene mounted");

  return (
    <group camera={{ position: [0, 1, 5] }}>
      <ResetCamera />
      {/* atmosphere */}
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 4, 20]} />

      {/* lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, -5]} intensity={10} color="#a78bfa" />

      {/* camera */}
        <HallwayCamera hovered={hovered} />

      {/* doors */}
      {DOOR_CONFIGS.map((config, i) => {
        const transform = getDoorTransform(i, DOOR_CONFIGS.length);

        return (
          <Door
            key={config.id}
            config={config}
            transform={transform}
            isHovered={hovered?.id === config.id}
            onHover={setHovered}
          />
        );
      })}
    </group>
  );
}