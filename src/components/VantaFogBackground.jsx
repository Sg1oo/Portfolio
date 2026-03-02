import { useEffect, useRef } from "react";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";

export default function VantaFogBackground() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = FOG({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        highlightColor: 0x222019,
        midtoneColor: 0x483a3a,
        lowlightColor: 0x443b66,
        baseColor: 0xa287c9,
        blurFactor: 0.6,
        speed: 1.0,
        zoom: 1.0,
        scale: 2.0,
        scaleMobile: 4.0,
        backgroundAlpha: 1.0,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -20,
      }}
    />
  );
}
