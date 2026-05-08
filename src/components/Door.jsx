/* eslint-disable react-hooks/set-state-in-effect */
import { useRef,useEffect,useState } from "react";
import { useFrame } from "@react-three/fiber";
import DoorLabel from "./DoorLabel";
import * as THREE from "three";

export default function Door({
  config,
  transform,
  isHovered,
  onHover,
}) {
  const ref = useRef();
  const [showLabel, setShowLabel] = useState(false);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    const baseGlow = 0.3 + Math.sin(t * 0.6) * 0.05;

    ref.current.material.emissiveIntensity =
      isHovered ? baseGlow + 2 : baseGlow;
  });
  useEffect(() => {
  if (ref.current) {
    ref.current.lookAt(0, 0, 0);
  }
}, []);
useEffect(() => {
  let timeout;
  if (isHovered) {
    timeout = setTimeout(() => setShowLabel(true), 90);
  } else {
    setShowLabel(false);
  }
  return () => clearTimeout(timeout);
}, [isHovered]);

  return (
    <mesh
      ref={ref}
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
      <boxGeometry args={[1, 2, 0.1]} />
      <meshStandardMaterial
        color={config.color}
        emissive={config.emissive}
      />
      <DoorLabel label={config.label} visible={showLabel} isHovered={isHovered} />
    </mesh>
  );
}