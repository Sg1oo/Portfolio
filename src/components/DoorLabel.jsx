import { Html } from "@react-three/drei";

export default function DoorLabel({ label, visible, isHovered }) {
  return (
    <Html
      transform
      position={[0, 0, 0.06]}
      distanceFactor={5}
      style={{
        width: "70px",
        textAlign: "center",
        pointerEvents: "none",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(-10px)" : "translateY(0px)",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "3px 3px",
          color: isHovered ? "white" : "rgb(255, 255, 255)",
          fontSize: "0.9rem",
          letterSpacing: "2px",
          textTransform: "lowercase",
          whiteSpace: "normal",
          textAlign: "center",
          textShadow: "0 0 8px #28223d, 0 0 20px #2a2048",
          WebkitTextStroke: "0.5px #31284b70",
        }}
      >
        {label}
      </div>
    </Html>
  );
}