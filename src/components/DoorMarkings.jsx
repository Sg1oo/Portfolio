//import { Html } from "@react-three/drei";
import DoorOverlay from "./DoorOverlay";

export default function DoorMarkings({ config, isHovered }) {
  if (!config.overlay) return null;

  return (
    <group>
      <DoorOverlay
        textureUrl={config.overlay.texture}
        isHovered={isHovered}
        opacity={config.overlay.opacity}
        tint={config.overlay.tint}
      />
    </group>
  );
}
