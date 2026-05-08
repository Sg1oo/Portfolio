import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


export default function ForestSideLayer({
  textureUrl,
  side = "left", // "left" or "right"
  progress = 0, // 0 to 1, from scroll
  z = -16,
  startX = side === "left" ? -10 : 10,
  endX = side === "left" ? -5 : 5,
  meshPosition = [0, 0, 0],
}) {
  const meshRef = useRef();

  const texture = useMemo(() => {
    if (!textureUrl) {
      console.error("ForestSideLayer: textureUrl is undefined");
      return null;
    }
    const loader = new THREE.TextureLoader();
    return loader.load(
      textureUrl,
      () => console.log("Texture loaded successfully:", textureUrl),
      undefined,
      (error) => console.error("Texture loading failed:", textureUrl, error)
    );
  }, [textureUrl]);

  useFrame(() => {
    if (!meshRef.current || !texture) return;

    // Calculate position based on progress
    const t = progress;
    const eased = t * t * (3 - 2 * t); // smoothstep

    const currentX = startX + (endX - startX) * eased;

    meshRef.current.position.x = currentX+meshPosition[0];
    meshRef.current.position.y = meshPosition[1];

    

    // Fade in opacity as progress increases
    meshRef.current.material.opacity = 0.5 + 0.95 * progress; // Adjust opacity range as needed
  });

  if (!texture) return null;

  return (
    <group position={[0, 0, z]}>
      <mesh ref={meshRef} position={meshPosition} scale={[1, 1.5, 1]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={progress}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}