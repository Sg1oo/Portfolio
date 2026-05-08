export function getDoorTransform(index, total, radius = 8) {
  const spread = Math.PI / 2.5; // adjust curvature
  const start = -spread / 2;
  const t = total === 1 ? 0.5 : index / (total - 1);
  const angle = start + t * spread;

  const x = Math.sin(angle) * radius;
  const z = -Math.cos(angle) * radius;

  return {
    position: [x, 0, z],
    angle
  };
}