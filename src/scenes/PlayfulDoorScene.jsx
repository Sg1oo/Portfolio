import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCallback, useRef, useState, useEffect } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import ForestBackgroundLayer from "../components/ForestBackgroundLayer";
import ForestSideLayer from "../components/ForestSideLayer";
import SceneController from "../components/SceneController";
import Canopy from "../components/Canopy";
import HallwayScene from "../components/HallWayScenee";
import LeftSideLayer from "../assets/left_side_layer.png"
import RightSideLayer from "../assets/right_side_layer.png"
import BackgroundLayer from "../assets/dense_bckgrnd.png"

const PHASE_SEQUENCE = ["approach", "ready", "entering", "transition", "done", "hallway"];

function Glow({ progress, phase, advancePhase }) {
  const materialRef = useRef();
  const [visible, setVisible] = useState(false);
  const progressRef = useRef(progress);
  // approach -> ready -> entering -> transition -> done
  const phaseRef = useRef(phase);
  const meshRef = useRef();
  const transitionTimeoutRef = useRef(null);
  const latchedZRef = useRef(null);
  const scaleRef = useRef(1);
  const glowExitProgressRef = useRef(0); // for fade-out after done

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  //Glow delay & cleanup
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => {
      clearTimeout(timer);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  //defensive reset
  useEffect(() => {
    if (phase === "approach") {
      scaleRef.current = 1;
      glowExitProgressRef.current = 0;
    }
  }, [phase]);

  useFrame(({ clock, camera }) => {
    if (!materialRef.current || !visible) return;

    const currentProgress = progressRef.current;
    const currentPhase = phaseRef.current;
    const t = clock.elapsedTime;

    let targetZ;
    const fade = Math.min((t - 1) * 0.2, 0.8);
    const baseGlow = 0.2 + currentProgress;
    let opacity = Math.max(fade, baseGlow);

    // 1. Timeout Logic
    if (currentPhase === "entering") {
      if (opacity > 0.95 && !transitionTimeoutRef.current) {
        transitionTimeoutRef.current = setTimeout(() => {
          advancePhase("entering", "transition");
          console.log("Phase advanced to transition");
          transitionTimeoutRef.current = null;
        }, 500);
      }
    } else if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // 2. Camera Latching & Drift Logic
    if (currentPhase === "transition" || currentPhase === "done") {
      // THE FIX: Latch to the camera's exact physical position on frame 1
      if (latchedZRef.current === null) {
        latchedZRef.current = camera.position.z;
      }

      // Add the cinematic forward drift and UP-scale ONLY during the transition wait
      if (currentPhase === "transition") {
        latchedZRef.current -= 0.01;
        console.log(camera.position.z);
        scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 15, 0.025);
        meshRef.current.scale.setScalar(scaleRef.current);
      }

      targetZ = latchedZRef.current;
      opacity = 1;
    } else {
      // When in approach/ready/entering, follow the scroll strictly
      targetZ = 5 - currentProgress * 18;
      latchedZRef.current = null; // Reset when not in transition
    }

    // Apply Lerp
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    materialRef.current.opacity = THREE.MathUtils.clamp(opacity, 0, 1);

    // 3. Emissive Logic
    let emissive = 10 + Math.sin(t * 2) * 0.4;

    // Use 1 (100%) during transition so the glow doesn't drop if progress resets
    const displayProgress =
      currentPhase === "transition" || currentPhase === "done"
        ? 1
        : currentProgress;

    if (currentPhase === "entering" || currentPhase === "transition") {
      emissive += displayProgress * 10;
    }
    if (currentPhase === "done") {
      emissive += 8;
      glowExitProgressRef.current = Math.min(glowExitProgressRef.current + 0.008, 1);
      const exitEased =
        glowExitProgressRef.current * glowExitProgressRef.current; // ease in
      materialRef.current.opacity = THREE.MathUtils.lerp(1, 0, exitEased);

       meshRef.current.scale.setScalar(scaleRef.current);
    }

    materialRef.current.emissiveIntensity = emissive;
  });

  if (!visible) return null;

  return (
    <>
      <mesh
        ref={meshRef}
        position={[0, -0.35, -15]}
        onClick={() => {
          if (phase === "ready") {
            advancePhase("ready", "entering");
            console.log("Phase advanced to entering");
          }
        }}
        onPointerOver={() => {
          if (phase === "ready") {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[0.3, 0.6]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={2}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.35, -15.01]}>
        <planeGeometry args={[0.6, 1.2]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.025} />
      </mesh>
      <mesh position={[0, -0.35, -15.02]}>
        <planeGeometry args={[0.8, 1.6]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.015} />
      </mesh>
    </>
  );
}

export default function PlayfulDoorScene() {
  const [progress, setProgress] = useState(0);
  const [warningOpacity, setWarningOpacity] = useState(0);
  const warningTimerRef = useRef(null);
  const enterTimerRef = useRef(null);
  const doneTimerRef = useRef(null);
  const [phase, setPhase] = useState("approach");
  // approach → ready → entering → transition → done
  const phaseRef = useRef(phase);
  const hallwayTimerRef = useRef(null);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Function to advance phase with validation
  const advancePhase = useCallback((from, to) => {
    setPhase((current) => {
      const currentIndex = PHASE_SEQUENCE.indexOf(current);
      const fromIndex = PHASE_SEQUENCE.indexOf(from);
      const toIndex = PHASE_SEQUENCE.indexOf(to);

      if (currentIndex === fromIndex && toIndex === fromIndex + 1) {
        return to;
      }

      return current;
    });
  }, []);

  // Handle scroll input for progress and warnings
  useEffect(() => {
    const handleWheel = (e) => {
      // Only allow scrolling to affect progress during the "approach" phase
      if (phaseRef.current !== "approach") return;

      if (e.deltaY > 0) {
        e.preventDefault();
        setProgress((p) => Math.min(p + 0.04, 1));
      } else {
        setWarningOpacity(1);
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }

        warningTimerRef.current = setTimeout(() => {
          setWarningOpacity(0);
        }, 2500);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  //advance phase from "approach" to "ready" when progress is high enough
  useEffect(() => {
    if (progress >= 0.9 && phase === "approach") {
      // Pushes the update to the next frame so React doesn't complain
      const timeout = setTimeout(() => {
        advancePhase("approach", "ready");
        console.log("Phase advanced to ready");
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [progress, phase, advancePhase]);

  useEffect(() => {
    if (phase !== "transition") {
      if (doneTimerRef.current) {
        clearTimeout(doneTimerRef.current);
        doneTimerRef.current = null;
      }
      return;
    }

    doneTimerRef.current = setTimeout(() => {
      advancePhase("transition", "done");
      doneTimerRef.current = null;
      console.log("Phase advanced to done");
    }, 2000);

    return () => {
      if (doneTimerRef.current) {
        clearTimeout(doneTimerRef.current);
        doneTimerRef.current = null;
      }
    };
  }, [advancePhase, phase]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "done") {
      if (hallwayTimerRef.current) {
        clearTimeout(hallwayTimerRef.current);
        hallwayTimerRef.current = null;
      }
      return;
    }

    hallwayTimerRef.current = setTimeout(() => {
      advancePhase("done", "hallway");
      console.log("Phase advanced to hallway");
      hallwayTimerRef.current = null;
    }, 800);
    return () => {
      if (hallwayTimerRef.current) clearTimeout(hallwayTimerRef.current);
    };
  }, [phase, advancePhase]);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ position: "fixed", inset: 0 }}
      >
        <fogExp2 attach="fog" args={["#0b0b0b", 0.04]} />
        <color attach="background" args={["black"]} />
        <SceneController phase={phase} progress={progress} />

        {phase !== "hallway" && (
          <>
            <EffectComposer>
              <Bloom
                intensity={phase === "approach" || phase === "ready" ? 4 : 1.5}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
              />
            </EffectComposer>
            <Glow
              progress={progress}
              phase={phase}
              advancePhase={advancePhase}
            />
            <pointLight
              position={[0, 0, -14]}
              intensity={80}
              distance={20}
              color="#a78bfa"
            />
            <Canopy
              progress={progress}
              count={190}
              startPosition={[-15, 10, -17]}
              endPosition={[0, 7.25, -17]}
              spreadX={16}
              minY={-1.5}
              maxY={2.5}
              depth={7}
            />
            <Canopy
              progress={progress}
              count={90}
              startPosition={[-15, 10, -17]}
              endPosition={[0, 7.25, -17]}
              spreadX={16}
              minY={-1.5}
              maxY={2.5}
              depth={5}
            />
            <Canopy
              progress={progress}
              count={70}
              startPosition={[15, 11.5, -16]}
              endPosition={[0, 7.25, -16]}
              spreadX={14}
              minY={-1.2}
              maxY={2.2}
              depth={4.5}
            />
            <Canopy
              progress={progress}
              count={55}
              startPosition={[5, 10, -15]}
              endPosition={[0, 8.5, -15]}
              spreadX={12}
              minY={-1}
              maxY={2}
              depth={4}
            />
            <ForestSideLayer
              textureUrl={LeftSideLayer}
              side="left"
              progress={progress}
              z={-17}
              startX={-10}
              endX={-5}
              meshPosition={[-1, -1, 0]}
            />
            <ForestSideLayer
              textureUrl={RightSideLayer}
              side="right"
              progress={progress}
              z={-17}
              startX={10}
              endX={5}
              meshPosition={[1, -1, 0]}
            />
            <ForestSideLayer
              textureUrl={LeftSideLayer}
              side="left"
              progress={progress}
              z={-16}
              startX={-10}
              endX={-7}
              meshPosition={[-2, -2, 0]}
            />
            <ForestSideLayer
              textureUrl={RightSideLayer}
              side="right"
              progress={progress}
              z={-16}
              startX={10}
              endX={7}
              meshPosition={[2, -2, 0]}
            />
            <ForestSideLayer
              textureUrl={LeftSideLayer}
              side="left"
              progress={progress}
              z={-15}
              startX={-12}
              endX={-9}
              meshPosition={[-3, -3, 0]}
            />
            <ForestSideLayer
              textureUrl={RightSideLayer}
              side="right"
              progress={progress}
              z={-15}
              startX={12}
              endX={9}
              meshPosition={[3, -3, 0]}
            />

            <ForestBackgroundLayer textureUrl={BackgroundLayer} z={-25.0} />
          </>
        )}
        {phase === "hallway" && <HallwayScene phase={phase} />}
      </Canvas>
      {phase === "ready" && (
        <div
          onClick={() => {
            if (enterTimerRef.current) return;

            enterTimerRef.current = setTimeout(() => {
              advancePhase("ready", "entering");
              console.log("Phase advanced to entering");
              enterTimerRef.current = null;
            }, 0);
          }}
          style={{
            cursor: "pointer",
            position: "fixed",
            bottom: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "3px",
            fontSize: "0.9rem",
            transition: "opacity 1s ease",
          }}
        >
          click to enter
        </div>
      )}

      {/* Warning message outside Canvas */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "51%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "rgba(255,255,255,0.6)",
          fontSize: "1rem",
          letterSpacing: "2px",
          opacity: warningOpacity,
          transition: "opacity 2s ease",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        there's no turning back now
      </div>
    </>
  );
}
