import * as THREE from "three";
import { fogUniforms } from "./fogUniforms";

export function applyBetterFog(material) {
  material.onBeforeCompile = (shader) => {

    // -----------------------------------
    // Attach uniforms
    // -----------------------------------

    shader.uniforms.uTime = fogUniforms.uTime;
    shader.uniforms.uFogColor = fogUniforms.uFogColor;
    shader.uniforms.uFogDensity = fogUniforms.uFogDensity;
    shader.uniforms.uFogHeightMin = fogUniforms.uFogHeightMin;
    shader.uniforms.uFogHeightMax = fogUniforms.uFogHeightMax;

    // -----------------------------------
    // Add varying to vertex shader
    // -----------------------------------

    shader.vertexShader =
      `
      varying vec3 vWorldPosition;
      varying float vFogDepth;
      ` + shader.vertexShader;

    // -----------------------------------
    // Inject world position
    // -----------------------------------

    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `
  #include <worldpos_vertex>

  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);

  vWorldPosition = worldPos.xyz;

  vFogDepth = -mvPosition.z;
  `,
    );

    // -----------------------------------
    // Add uniforms to fragment shader
    // -----------------------------------

    shader.fragmentShader =
      `
      uniform float uTime;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform float uFogHeightMin;
      uniform float uFogHeightMax;

      varying vec3 vWorldPosition;
      varying float vFogDepth;

      #define LOG2 1.442695

      // -----------------------------------
      // Simple noise
      // -----------------------------------

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);

        f = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(
            mix(hash(i + vec3(0,0,0)),
                hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)),
                hash(i + vec3(1,1,0)), f.x),
            f.y),
          mix(
            mix(hash(i + vec3(0,0,1)),
                hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)),
                hash(i + vec3(1,1,1)), f.x),
            f.y),
          f.z
        );
      }

      ` + shader.fragmentShader;

    // -----------------------------------
    // Replace default fog
    // -----------------------------------

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_fragment>",
      `
      // -----------------------------------
      // Height fog
      // -----------------------------------

      float heightFactor = smoothstep(
        uFogHeightMax,
        uFogHeightMin,
        vWorldPosition.y
      );

      // -----------------------------------
      // Animated noise
      // -----------------------------------

      vec3 noisePos = vWorldPosition * 0.15;

      noisePos.x += uTime * 0.05;
      noisePos.z += uTime * 0.03;

      float n = noise(noisePos);

      n = smoothstep(0.35, 1.0, n);

      heightFactor *= n;

      // -----------------------------------
      // Exponential fog
      // -----------------------------------

      float fogFactor = exp2(
        -uFogDensity *
        uFogDensity *
        vFogDepth *
        vFogDepth *
        LOG2
      );

      fogFactor = clamp(fogFactor, 0.0, 1.0);

      fogFactor *= heightFactor;

      gl_FragColor.rgb = mix(
        uFogColor,
        gl_FragColor.rgb,
        fogFactor
      );
      `
    );
  };

  material.needsUpdate = true;
}