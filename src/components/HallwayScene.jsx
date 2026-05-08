import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { DOOR_CONFIGS } from "../data/doorConfigs";
//import { getDoorTransform } from "../utils/getDoorPosition";
import Door from "../components/Door";
import HallwayCamera from "../components/HallwayCamera";

// export default function HallwayScene() {
//   const [hovered, setHovered] = useState(null);

//   return (
//     <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
      
//       {/* atmosphere */}
//       <color attach="background" args={["#050508"]} />
//       <fog attach="fog" args={["#050508", 4, 20]} />

//       {/* lighting */}
//       <ambientLight intensity={0.3} />
//       <pointLight position={[0, 2, -5]} intensity={10} color="#a78bfa" />

//       {/* camera */}
//       <HallwayCamera hovered={hovered} />

//       {/* doors */}
//       {DOOR_CONFIGS.map((config, i) => {
//         const transform = getDoorTransform(i, DOOR_CONFIGS.length);

//         return (
//           <Door
//             key={config.id}
//             config={config}
//             transform={transform}
//             isHovered={hovered?.id === config.id}
//             onHover={setHovered}
//           />
//         );
//       })}

//     </Canvas>
//   );
// }

const DOOR_CONFIGSS = [
  { id: "crimson",  pos: [-2.2, 0, -8],  rot: [0, 0.15, 0],  color: "#ff4466", emissive: "#ff2244" },
  { id: "azure",    pos: [2.2,  0, -11], rot: [0, -0.12, 0], color: "#4488ff", emissive: "#2255ff" },
  { id: "verdant",  pos: [-2.4, 0, -15], rot: [0, 0.18, 0],  color: "#44ff88", emissive: "#22cc66" },
  { id: "ember",    pos: [2.3,  0, -18], rot: [0, -0.1, 0],  color: "#ff9944", emissive: "#ff6622" },
  { id: "violet",   pos: [-2.1, 0, -22], rot: [0, 0.14, 0],  color: "#bb44ff", emissive: "#8822ee" },
  { id: "aether",   pos: [2.4,  0, -25], rot: [0, -0.15, 0], color: "#44ffee", emissive: "#22ccbb" },
];

// eslint-disable-next-line no-unused-vars
function getDoorPosition(index, total, radius = 8) {
  const spread = Math.PI / 3; // 60 degrees
  const start = -spread / 2;

  const angle = start + (index / (total - 1)) * spread;

  const x = Math.sin(angle) * radius;
  const z = -Math.cos(angle) * radius;

  return [x, 0, z];
}
function HallwayCameraa({ hoveredDoor }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!hoveredDoor) {
      target.current.set(0, 0, 0);
    } else {
      target.current.copy(hoveredDoor.position);
    }

    camera.lookAt(
      THREE.MathUtils.lerp(camera.rotation.x, target.current.x, 0.02),
      THREE.MathUtils.lerp(camera.rotation.y, target.current.y, 0.02),
      THREE.MathUtils.lerp(camera.rotation.z, target.current.z, 0.02)
    );
  });

  return null;
}

function HallwayDoor({ config, revealProgress, index }) {
  const matRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    if (!matRef.current || !lightRef.current) return;
    const t = clock.elapsedTime;
    const pulse = 0.5 + Math.sin(t * 1.4 + index * 0.9) * 0.3;
    const ep = Math.min(revealProgress.current, 1);
    matRef.current.emissiveIntensity = ep * (0.15 + pulse * 0.1);
    lightRef.current.intensity = ep * (0.6 + pulse * 0.4);
  });

  return (
    <group position={config.pos} rotation={config.rot}>
      {/* Door panel */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.4, 3.0, 0.08]} />
        <meshStandardMaterial
          ref={matRef}
          color="#08060f"
          emissive={config.emissive}
          emissiveIntensity={0}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Frame — left post */}
      <mesh position={[-0.78, 1.6, 0]}>
        <boxGeometry args={[0.1, 3.2, 0.12]} />
        <meshStandardMaterial color={config.color} emissive={config.emissive}
          emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* Frame — right post */}
      <mesh position={[0.78, 1.6, 0]}>
        <boxGeometry args={[0.1, 3.2, 0.12]} />
        <meshStandardMaterial color={config.color} emissive={config.emissive}
          emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* Frame — top beam */}
      <mesh position={[0, 3.25, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.12]} />
        <meshStandardMaterial color={config.color} emissive={config.emissive}
          emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Point light behind door */}
      <pointLight
        ref={lightRef}
        position={[0, 1.6, -0.5]}
        color={config.color}
        intensity={0}
        distance={6}
        decay={2}
      />
    </group>
  );
}

export default function HallwayScene() {
  const revealProgress = useRef(0);
  const camTargetZ = useRef(-5);
  const corridorRef = useRef();

  useFrame(({ camera }) => {
    // Slowly reveal
    revealProgress.current = Math.min(revealProgress.current + 0.004, 1);

    // Gentle forward drift + sway
    camTargetZ.current -= 0.012;
    const swayX = Math.sin(Date.now() * 0.0003) * 0.25;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, swayX, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ.current, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2, 0.02);
    camera.lookAt(0, 0.5, camera.position.z - 10);
  });

  return (
    <group ref={corridorRef}>
      {/* Corridor floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -15]}>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#ff0000" roughness={0.9} metalness={0.15} />
      </mesh>

      {/* Corridor ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, -15]}>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#b30303" roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 2, -15]}>
        <planeGeometry args={[40, 5]} />
        <meshStandardMaterial color="#d11d62" roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 2, -15]}>
        <planeGeometry args={[40, 5]} />
        <meshStandardMaterial color="#af1839" roughness={0.95} />
      </mesh>

      {/* Ambient corridor light */}
      <ambientLight intensity={0.08} color="#28a32d" />

      {/* Ceiling strip lights */}
      {[0, -8, -16, -24].map((z, i) => (
        <pointLight key={i} position={[0, 4, z]} color="#59328a"
          intensity={0.3} distance={10} decay={2} />
      ))}

      {/* Doors */}
      {DOOR_CONFIGSS.map((config, i) => (
        <HallwayDoor
          key={config.id}
          config={config}
          revealProgress={revealProgress}
          index={i}
        />
      ))}
    </group>
  );
}