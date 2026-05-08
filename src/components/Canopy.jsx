import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const LAYER_RATIOS = [0.4, 0.3, 0.3];
const LEAF_COLORS = ["#f6fffa00", "#ffffff00", "#f7f7f700"];

function splitCount(total) {
  const first = Math.max(1, Math.round(total * LAYER_RATIOS[0]));
  const second = Math.max(1, Math.round(total * LAYER_RATIOS[1]));
  const third = Math.max(1, total - first - second);

  return [first, second, third];
}

export default function Canopy({
  progress = 0,
  count = 80,
  startPosition = [0, 10, -17],
  endPosition = [0, 6, -17],
  spreadX = 16,
  minY = -1.5,
  maxY = 2.5,
  depth = 5,
}) {
  const meshA = useRef();
  const meshB = useRef();
  const meshC = useRef();
  const leavesA = useRef([]);
  const leavesB = useRef([]);
  const leavesC = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const counts = useMemo(() => splitCount(Math.max(3, count)), [count]);
  const [countA, countB, countC] = counts;

  const start = useMemo(
    () => new THREE.Vector3(...startPosition),
    [startPosition]
  );
  const end = useMemo(() => new THREE.Vector3(...endPosition), [endPosition]);

  const geometries = useMemo(() => {
    const makeShape = (points) => {
      const shape = new THREE.Shape();
      const pts = points.map(([x, y]) => new THREE.Vector2(x, y));
      const curve = new THREE.SplineCurve(pts);

      shape.setFromPoints(curve.getPoints(100));

      return new THREE.ShapeGeometry(shape);
    };

    return [
      makeShape([[-0.5, 0], [0, 0.25], [0.4, 0], [0, -0.3], [-0.5, 0]]),
      makeShape([[-0.3, 0], [0, 0.7], [0.4, 0], [0, -0.5], [-0.3, 0]]),
      makeShape([[-0.7, 0], [0, 0.3], [0.5, 0], [0, -0.2], [-0.4, 0]]),
    ];
  }, []);

  useEffect(() => {
    const makeLeaves = (layerCount, layerIndex) =>
      Array.from({ length: layerCount }, () => ({
        xOffset: (Math.random() - 0.5) * spreadX,
        yOffset: THREE.MathUtils.lerp(minY, maxY, Math.random()),
        zOffset: -Math.random() * depth + layerIndex * 0.15,
        scale: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.45 + Math.random() * 0.7,
      }));

    leavesA.current = makeLeaves(countA, 0);
    leavesB.current = makeLeaves(countB, 1);
    leavesC.current = makeLeaves(countC, 2);
  }, [countA, countB, countC, depth, maxY, minY, spreadX]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    anchor.copy(start).lerp(end, progress);

    const update = (mesh, leaves) => {
      if (!mesh.current) return;

      leaves.current.forEach((leaf, index) => {
        const swayX = Math.sin(time * leaf.speed + leaf.phase) * 0.22;
        const swayY = Math.cos(time * leaf.speed * 0.7 + leaf.phase) * 0.16;

        dummy.position.set(
          anchor.x + leaf.xOffset + swayX,
          anchor.y + leaf.yOffset + swayY,
          anchor.z + leaf.zOffset
        );

        dummy.rotation.x = Math.sin(time + leaf.phase) * 0.16;
        dummy.rotation.y = Math.cos(time * 0.85 + leaf.phase) * 0.18;
        dummy.rotation.z = Math.sin(time * 1.15 + leaf.phase) * 0.28;
        dummy.scale.setScalar(leaf.scale);

        dummy.updateMatrix();
        mesh.current.setMatrixAt(index, dummy.matrix);
      });

      mesh.current.instanceMatrix.needsUpdate = true;
    };

    update(meshA, leavesA);
    update(meshB, leavesB);
    update(meshC, leavesC);
  });

  return (
    <group>
      <instancedMesh
        ref={meshA}
        args={[geometries[0], null, countA]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={LEAF_COLORS[0]} side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh
        ref={meshB}
        args={[geometries[1], null, countB]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={LEAF_COLORS[1]} side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh
        ref={meshC}
        args={[geometries[2], null, countC]}
        frustumCulled={false}
      >
        <meshStandardMaterial color={LEAF_COLORS[2]} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
}
