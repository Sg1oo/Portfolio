import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

function Glow() {
  const meshRef = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 800); // slight pause after darkness

    return () => clearTimeout(timer);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !visible) return;

    meshRef.current.material.opacity =
      0.5 + Math.sin(clock.elapsedTime * 2) * 0.2;
  });

  if (!visible) return null;

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[1.2, 2.2]} />
      <meshBasicMaterial
        color="#8f6bff"
        transparent
        opacity={0.6}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function PlayfulDoorScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: "fixed", inset: 0 }}
    >
      <color attach="background" args={["black"]} />
      <Glow />
    </Canvas>
  );
}