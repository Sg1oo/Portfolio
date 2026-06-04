import tarotOverlay from "../assets/tarot-overlay.png";

export const DOOR_CONFIGS = [
  {
    id: "playful",
    label: "playful",
    color: "#15034d",
    emissive: "#3f0bdb",
    overlay: {
      texture: tarotOverlay,
      opacity: 0.88,
      tint: "#515097",
    },
    type: "internal", // or "external"
    target: "/playful-world"
  },
  {
    id: "trippy",
    label: "flow",
    color: "#140303",
    emissive: "#ff0202",
    overlay: {
      texture: tarotOverlay,
      opacity: 0.42,
      tint: "#ffd1d1",
    },
    type: "internal",
    target: "/flow-zone"
  },
  {
    id: "external-1",
    label: "wander",
    color: "#300505",
    emissive: "#f50808",
    overlay: {
      texture: tarotOverlay,
      opacity: 0.38,
      tint: "#ffe1ad",
    },
    type: "external",
    target: "https://example.com"
  },
  {
    id: "external-2",
    label: "curiosity",
    color: "#023b28",
    emissive: "#56e77a",
    overlay: {
      texture: tarotOverlay,
      opacity: 0.45,
      tint: "#c9ffe0",
    },
    type: "external",
    target: "https://example.com"
  },
];
