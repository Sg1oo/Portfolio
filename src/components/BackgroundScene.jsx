
// ---------------------------------------------------------------------------------------------------------
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import BokehParticles from "../components/BokehParticles";
import LightTrails from "../components/LightTrails";
import { EffectComposer, Bloom } from "@react-three/postprocessing";


/* ---------- Fog Layer ---------- */
function FogPlane({ z, scale, opacity, speed = 0.1 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.z =
      z + Math.sin(clock.elapsedTime * speed) * 0.25;
  });

  return (
    <Plane
      ref={ref}
      args={[1, 1]}
      position={[0, 0, z]}
      scale={scale}
    >
      <meshBasicMaterial
        color="#2a2a2a"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </Plane>
  );
}

/* ---------- Light Drift Layer ---------- */
function LightPlane({ z, scale, hue, speed }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;

    if (!ref.current) return;

    ref.current.position.x = Math.sin(t * 0.6) * 1.2;
    ref.current.position.y = Math.cos(t * 0.4) * 0.8;
    ref.current.material.opacity = 0.08 + Math.sin(t) * 0.03;
  });

  return (
    <Plane ref={ref} args={[1, 1]} position={[0, 0, z]} scale={scale}>
      <meshBasicMaterial
        color={new THREE.Color(`hsl(${hue}, 20%, 40%)`)}
        
        transparent
        blending={THREE.AdditiveBlending}
        opacity={0.1}
        depthWrite={false}
        toneMapped={false}
      />
    </Plane>
  );
}

/* ---------- Parallax Camera ---------- */
function ParallaxCamera() {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    target.current.set(
      mouse.x * 0.3,
      mouse.y * 0.3,
      camera.position.z
    );
    camera.position.lerp(target.current, 0.04);
  });

  return null;
}

/* ---------- Vignette ---------- */
function Vignette() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.2,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.7, "rgba(0,0,0,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0.55)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={[0, 0, 4.9]}>
      <planeGeometry args={[20, 12]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}


/* ---------- Main Background Scene ---------- */
export default function BackgroundScene() {
  return (
    <div className="background-canvas"
     style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        opacity: 0.7,
      }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* base darkness */}
        <color attach="background" args={["#0b0b0b"]} />
        <fog attach="fog" args={["#0b0b0b", 3, 9]} />

        <ParallaxCamera />

        

        {/* fog layers */}
        <FogPlane z={0} scale={[10, 7, 1]} opacity={0.15} speed={0.18} />
        <FogPlane z={-1.5} scale={[14, 7, 1]} opacity={0.1} speed={0.06} />
        <FogPlane z={-3} scale={[18, 7, 1]} opacity={0.07} speed={0.04} />
        <FogPlane z={-4.5} scale={[22, 7, 1]} opacity={0.06} speed={0.025} />

        <BokehParticles />
        
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        {/* light drift layers */}
        <LightPlane z={-0.5} scale={[6, 4, 1]} hue={210} speed={0.15} />
        <LightPlane z={-2} scale={[8, 5, 1]} hue={260} speed={0.1} />
        
        {/* vignette */}
        <Vignette />
      </Canvas>
    </div>
  );
}
