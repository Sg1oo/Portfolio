import * as THREE from "three";

export default function FloorGlow({ color = "#a78bfa" }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.01, 0]}
    >
      <circleGeometry args={[1.2, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}