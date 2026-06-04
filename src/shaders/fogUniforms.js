
import * as THREE from 'three'

export const fogUniforms = {
  uTime: { value: 0.0 },
  uFogHeightMin: { value: -1.0 },
  uFogHeightMax: { value: 3.0 },
  uFogDensity: { value: 0.5 },
  uFogColor: { value: new THREE.Color(0xefd1b5) }
};