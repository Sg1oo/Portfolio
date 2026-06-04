/**
 * DoorHaze.jsx
 *
 * Drop this as a child (or sibling) inside your Door.jsx.
 * It assumes door dimensions: WIDTH=1, HEIGHT=2 (units).
 * Adjust DOOR_W and DOOR_H at the top if yours differ.
 *
 * Usage in Door.jsx:
 *   import DoorHaze from "./DoorHaze"
 *   ...
 *   <group>
 *     <DoorHaze color="#9b5cff" />
 *     <mesh> ... your door mesh ... </mesh>
 *   </group>
 */

import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame, extend, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { TextureLoader } from "three";

// ─── Tuning constants ────────────────────────────────────────────────────────
const DOOR_W = 1; // door mesh width in units
const DOOR_H = 2; // door mesh height in units
const HAZE_LAYERS = 6; // more layers = denser haze (costs draw calls)
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. HAZE PLANE MATERIAL ───────────────────────────────────────────────────
// Rises upward, flame-shaped: wide at base, tapers to a point at top.
// Fully symmetric around the vertical center axis (vUv.x = 0.5).
const HazeMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color("#9b5cff"), uOpacity: 0.18 },
  /* vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform sampler2D uMask;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i),             hash(i + vec2(1,0)), u.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
        u.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 3; i++) {
        v += a * smoothNoise(p);
        p  *= 2.1;
        a  *= 0.5;
      }
      return v;
    }

    void main() {
      // ── Symmetric UV ────────────────────────────────────────────────────
      // Fold x around 0.5 so left == right before any noise is applied.
      // cx goes from 0.0 (edges) to 0.5 (center).
      float cx = abs(vUv.x - 0.5);

      // ── Flame taper ──────────────────────────────────────────────────────
      // At vUv.y = 0 (base) the flame is full-width; at y = 1 (tip) it
      // narrows to a tight point.  We squeeze the horizontal coordinate
      // proportionally so noise samples bunch together toward the tip.
      float taper = mix(1.0, 0.08, pow(vUv.y, 1.4));  // width multiplier
      float taperedX = cx / max(taper, 0.001);         // expanded in noise space

      // ── Sample noise symmetrically ───────────────────────────────────────
      // Use abs(taperedX) centred noise so both halves get the same pattern.
      // Upward drift on Y, NO horizontal shift (that would break symmetry).
      vec2 noiseUv;
      noiseUv.x = taperedX * 3.5;
      noiseUv.y = (vUv.y - uTime * 0.06) * 3.5;

      float n = fbm(noiseUv);

      // ── Flame silhouette ─────────────────────────────────────────────────
      // Edge mask: soft rolloff from center outward, tightens near tip.
      // Using cx (0 = center, 0.5 = edge) — fully symmetric.
      float edgeFade = smoothstep(taper * 0.5, 0.0, cx);

      // Height alpha: strong at base, fades to nothing at top
      float heightFade = pow(1.0 - vUv.y, 1.4);

      // Inner flicker from noise
      float flicker = smoothstep(0.3, 0.72, n);

      float alpha = flicker * edgeFade * heightFade;

      // Optional mask texture
      float mask = texture2D(uMask, vUv).r;
      alpha *= mask;

      gl_FragColor = vec4(uColor, alpha * uOpacity);
    }
  `
);

// ── 2. VOLUMETRIC HALO MATERIAL ───────────────────────────────────────────────
// Soft radial glow behind the door frame — already symmetric, unchanged.
const HaloMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color("#9b5cff"), uOpacity: 0.55 },
  /* vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i),             hash(i + vec2(1,0)), u.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
        u.y
      );
    }

    void main() {
      vec2 uv = vUv - 0.5;

      float dist = length(uv * vec2(0.85, 1.1));

      float radial = 1.0 - smoothstep(0.0, 0.5, dist);
      radial = pow(radial, 2.2);

      vec2 noiseUv = vUv * 2.5;
      noiseUv.y -= uTime * 0.04;
      float n = smoothNoise(noiseUv);
      float wisp = smoothstep(0.4, 0.9, n) * 0.4;

      float alpha = (radial + wisp * radial) * uOpacity;

      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

// ── 3. FLOOR SPILL MATERIAL ───────────────────────────────────────────────────
// Elliptical light puddle on the floor — already symmetric, unchanged.
const FloorSpillMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color("#9b5cff"), uOpacity: 0.5 },
  /* vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i),             hash(i + vec2(1,0)), u.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
        u.y
      );
    }

    void main() {
      vec2 uv = vUv - vec2(0.5, 0.15);

      float dist = length(uv * vec2(1.0, 2.2));
      float radial = 1.0 - smoothstep(0.0, 0.45, dist);
      radial = pow(radial, 1.8);

      vec2 noiseUv = vUv * 4.0;
      noiseUv.x += uTime * 0.05;
      float shimmer = smoothNoise(noiseUv) * 0.3 + 0.7;

      float alpha = radial * shimmer * uOpacity;

      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

extend({ HazeMaterial, HaloMaterial, FloorSpillMaterial });

// ─────────────────────────────────────────────────────────────────────────────

export default function DoorHaze({ color = "#9b5cff", maskUrl }) {
  const hazeRefs = useRef([]);
  const haloRef = useRef();
  const spillRef = useRef();

  const offsets = useMemo(
    () => Array.from({ length: HAZE_LAYERS }, (_, i) => i * 0.7),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    hazeRefs.current.forEach((ref, i) => {
      if (ref?.material) ref.material.uniforms.uTime.value = t + offsets[i];
    });
    if (haloRef.current) haloRef.current.uniforms.uTime.value = t;
    if (spillRef.current) spillRef.current.uniforms.uTime.value = t;
  });

  const col = useMemo(() => new THREE.Color(color), [color]);

  const hazeW = DOOR_W * 3.15;
  const hazeH = DOOR_H * 2.65;

  const haloW = DOOR_W * 2.85;
  const haloH = DOOR_H * 3.2;

  const maskTexture = useLoader(TextureLoader, maskUrl);

  return (
    <group>
      {/* ── 1. Volumetric halo (furthest back) ── */}
      <mesh position={[0, DOOR_H * 0.5 - DOOR_H * 0.25, -0.55]}>
        <planeGeometry args={[haloW, haloH]} />
        <haloMaterial
          ref={haloRef}
          uColor={col}
          uOpacity={0.55}
          uMask={maskTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── 2. Layered haze planes ── */}
      {Array.from({ length: HAZE_LAYERS }).map((_, i) => {
        const zOffset = -0.05 - i * 0.08;
        const yOffset = DOOR_H * 0.86 + i * 0.02;
        const opacity = 0.22 - i * 0.015;
        const scaleX = 1.0 + i * 0.06;
        const scaleY = 1.0 + i * 0.03;

        return (
          <mesh
            key={i}
            ref={(el) => (hazeRefs.current[i] = el)}
            position={[0, yOffset, zOffset]}
            scale={[scaleX, scaleY, 1]}
          >
            <planeGeometry args={[hazeW, hazeH]} />
            <hazeMaterial
              uColor={col}
              uOpacity={Math.max(opacity, 0.04)}
              uMask={maskTexture}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* ── 3. Floor spill light ── */}
      <mesh
        position={[0, -DOOR_H * 0.5, 0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[DOOR_W * 2.5, DOOR_W * 2.0]} />
        <floorSpillMaterial
          ref={spillRef}
          uColor={col}
          uOpacity={0.5}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
