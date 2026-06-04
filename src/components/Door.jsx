import { useRef,useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import DoorMarkings from "./DoorMarkings";
import FloorGlow from "./FloorGlow";
import * as THREE from "three";
import DoorHaze from "./DoorHaze";
import hazeMask from "../assets/white_turned_blackMask.png"
//import hazeMask2 from "../assets/Mask whiteBG.png"
export default function Door({
  config,
  transform,
  isHovered,
  onHover,
}) {
  const ref = useRef();
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    const baseGlow = 0.3 + Math.sin(t * 0.6) * 0.05;
    

    ref.current.material.emissiveIntensity =
      isHovered ? baseGlow + 2 : baseGlow;
  });
  useEffect(() => {
  if (groupRef.current) {
    groupRef.current.lookAt(0, 0, 0);
  }
}, []);

  return (
    <group
      ref={groupRef}
      position={transform.position}
      onPointerOver={() => onHover({ ...config, ...transform })}
      onPointerOut={() => onHover(null)}
      onClick={() => {
        if (config.type === "external") {
          window.open(config.target, "_blank");
        } else {
          console.log("navigate to", config.target);
        }
      }}
    >
     
      {/* LEFT EDGE */}
      <mesh position={[-0.52, 0, 0.025]}>
        <planeGeometry args={[0.03, 2]} />
        <meshBasicMaterial
          color={config.emissive}
          transparent
          opacity={0.95}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* RIGHT EDGE */}
      <mesh position={[0.52, 0, 0.025]}>
        <planeGeometry args={[0.03, 2]} />
        <meshBasicMaterial
          color={config.emissive}
          transparent
          opacity={0.95}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* TOP EDGE */}
      <mesh position={[0, 1.01, 0.025]}>
        <planeGeometry args={[1.07, 0.03]} />
        <meshBasicMaterial
          color={config.emissive}
          transparent
          opacity={0.95}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* MAIN DOOR PANEL */}
      <mesh ref={ref} position={[0, 0, 0]}>
        <DoorHaze color={config.emissive} maskUrl={hazeMask} />
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          color={config.emissive}
          emissive={config.color}
          opacity={0.75}
          transparent
          toneMapped={false}
          depthWrite={true}
          metalness={0.9}
        />
        <DoorMarkings
          config={config}
          isHovered={isHovered}
        />
        <FloorGlow color={config.emissive} />
      </mesh>
    </group>
  );
}
