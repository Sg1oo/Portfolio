import { useEffect, useRef } from "react";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";

export default function VantaBGforHallway() {
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
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x0,
        midtoneColor: 0x30309,
        lowlightColor: 0x13131a,
        baseColor: 0x414163,
        blurFactor: 0.56,
        speed: 1.1,
        zoom: 1.9,
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
        zIndex: -18,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
