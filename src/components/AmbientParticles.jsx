import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function pseudoRandom(seed) {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

export default function AmbientParticles({ count = 300 }) {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    const positions = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (pseudoRandom(i * 3 + 1) - 0.5) * 20, // x
        pseudoRandom(i * 3 + 2) * 6 - 2,      // y
        -pseudoRandom(i * 3 + 3) * 14 - 6         // z
      );
    }

    return new Float32Array(positions);
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y =
      Math.sin(clock.elapsedTime * 0.03) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.03}
        color="#cfcfff"
        transparent
        opacity={0.615}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}