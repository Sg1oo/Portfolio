import * as THREE from "three";
import { useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DOOR_CONFIGS } from "../data/doorConfigs";
import { getDoorTransform } from "../utils/getDoorPosition";
import Door from "../components/Door";
import Fog from "../components/Fog";
import HallwayCamera from "../components/HallwayCamera";
import { Html } from "@react-three/drei";
import { applyBetterFog } from "../shaders/applyBetterFog";
import { fogUniforms } from "../shaders/fogUniforms";
import AmbientParticles from "../components/AmbientParticles";
import AmbientPulse from "../components/AmbientPulse";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

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

  const FogMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#000000",
      roughness: 0.8,
      metalness: 0.2,
    });

    applyBetterFog(mat);

    return mat;
  }, []);

  useFrame((state) => {
    fogUniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      <ResetCamera />
      {/* atmosphere */}
      <AmbientParticles />
      <AmbientPulse />
      <>
      {/* faint base visibility */}
      <ambientLight intensity={0.08} color="#8899aa" />
      <spotLight
        position={[0, 6, -10]}
        angle={0.4}
        penumbra={0.5}
        intensity={10}
        color="#c4b5fd"
      />
      {/* central hallway glow */}
      <pointLight position={[0, 3, -18]} intensity={2} color="#6d5cff" />
      <pointLight
        position={[0, 3, -8]}
        intensity={8}
        distance={30}
        decay={2}
        color="#c4b5fd"
      />
      </>
      {/* camera */}
      <HallwayCamera hovered={hovered} />
       {/* <EffectComposer>
        <Bloom
          intensity={0.45}
          luminanceThreshold={1.05}
          luminanceSmoothing={0.08}
        />
      </EffectComposer>
      */}
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
      {/* floor */}
      <mesh position={[0, -2.3, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 30]} />
        <meshStandardMaterial
          color="#2e0f5f"
          roughness={0.38}
          metalness={7.2}
          opacity={1}
        />
      </mesh>
    </group>
  );
}
