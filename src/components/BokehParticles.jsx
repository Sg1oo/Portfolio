import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function generatePositions(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 10; // x
    arr[i * 3 + 1] = (Math.random() - 0.5) * 6; // y
    arr[i * 3 + 2] = -Math.random() * 6; // z
  }
  return arr;
}

export default function BokehParticles({ count = 80 }) {
  const ref = useRef();

  const positions = useMemo(() => generatePositions(count), [count]);

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.015;
    ref.current.position.x = mouse.x * 0.2;
    ref.current.position.y = mouse.y * 0.15;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        transparent
        color="#e6f0ff" // soft bluish white
        emissive="#a78bfa"
        emissiveIntensity={8}
        size={0.5}
        sizeAttenuation
        depthWrite={false}
        opacity={0.1}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
