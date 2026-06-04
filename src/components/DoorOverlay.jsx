import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

const DOOR_W = 1;
const DOOR_H = 2;

export default function DoorOverlay({
  textureUrl,
  isHovered,
  opacity = 0.5,
  tint = "#ffffff",
}) {
  const materialRef = useRef();
  const texture = useLoader(TextureLoader, textureUrl);

  const tintColor = useMemo(() => new THREE.Color(tint), [tint]);
  const overlayTexture = useMemo(() => {
    const clonedTexture = texture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.wrapS = THREE.ClampToEdgeWrapping;
    clonedTexture.wrapT = THREE.ClampToEdgeWrapping;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [texture]);

  useEffect(() => () => overlayTexture.dispose(), [overlayTexture]);

  useFrame(() => {
    if (!materialRef.current) return;

    const targetOpacity = isHovered ? opacity : 0;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      0.12
    );
  });

  return (
    <mesh position={[0, 0, 0.061]} renderOrder={5}>
      <planeGeometry args={[DOOR_W * 0.96, DOOR_H * 0.96]} />
      <meshBasicMaterial
        ref={materialRef}
        map={overlayTexture}
        color={tintColor}
        transparent
        opacity={isHovered ? opacity : 0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
