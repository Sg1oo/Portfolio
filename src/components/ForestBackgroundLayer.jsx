import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three";

export default function ForestBackgroundLayer({
  textureUrl,
  z = -25,
}) {

  const ref = useRef()

  const texture = useMemo(() => {
      if (!textureUrl) {
        console.error("ForestBackgroundLayer: textureUrl is undefined");
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
  

  useFrame(({ camera }) => {

    if (!ref.current) return

    // camera approaching door
    const distance = Math.abs(camera.position.z)

    const opacity = Math.min(distance / 10, 1)

    ref.current.material.opacity = opacity
  })

  return (
    <mesh ref={ref} position={[0,1,z]}>
      <planeGeometry args={[20,12]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}