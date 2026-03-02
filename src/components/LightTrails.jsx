import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function LightTrails() {
  const materialRef = useRef();

  useFrame(({ clock, mouse }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
  });

  return (
    <mesh position={[0, -1.5, -4]}>
      <planeGeometry args={[20, 8]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uMouse;

          float trail(vec2 uv, float offset) {
            uv.y += sin(uv.x * 4.0 + uTime + offset) * 0.15;
            float line = abs(fract(uv.y * 6.0) - 0.5);
            return smoothstep(0.05, 0.0, line);
          }

          void main() {
            vec2 uv = vUv;
            uv.x += uMouse.x * 0.1;

            float t1 = trail(uv, 0.0);
            float t2 = trail(uv, 1.5);
            float t3 = trail(uv, 3.0);

            vec3 color =
              vec3(1.0, 0.3, 0.8) * t1 +
              vec3(0.3, 0.6, 1.0) * t2 +
              vec3(0.6, 1.0, 0.9) * t3;

            float glow = (t1 + t2 + t3) * 0.35;

            gl_FragColor = vec4(color * glow, glow);
          }
        `}
      />
    </mesh>
  );
}
