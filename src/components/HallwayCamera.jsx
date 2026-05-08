import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function HallwayCamera({ hovered }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const cameraPos = useRef(new THREE.Vector3());

  useFrame(() => {

    if(!cameraPos.current){
      cameraPos.current=camera.position.clone();
    }
    if (hovered && hovered.position) {
      targetPos.current.set(
        hovered.position[0],
        0,
        hovered.position[2]
      );
    } else {
      targetPos.current.set(0, 0, 0);
    }

    cameraPos.current.x += (targetPos.current.x * 0.15 - cameraPos.current.x) * 0.05;
    camera.position.copy(cameraPos.current);

    camera.lookAt(0, 0, -8);
  });

  return null;
}