"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { saveModelDoc, loadAllModels } from "../lib/firebase";
import debounce from "lodash.debounce";
import ModelItem from "@/components/ModelItem";

function TopDownCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 20, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function PerspectiveCameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function ThreeScene() {
  const [models, setModels] = useState(null);
  const [view, setView] = useState("3d");
  const otherBounds = useRef([]);

  const orbitRef = useRef();

  useEffect(() => {
    const camera = window.__APP_CAMERA__;
    if (!orbitRef.current || !camera) return;

    orbitRef.current.target.set(0, 0, 0);

    if (view === "3d") camera.up.set(0, 1, 0);
    else if (view === "2d") camera.up.set(0, 0, -1);

    orbitRef.current.update();
  }, [view]);

  const debouncedSave = useCallback(
    debounce(async (id, data) => {
      await saveModelDoc(id, data);
    }, 300),
    []
  );

  useEffect(() => {
    (async () => {
      const arr = await loadAllModels();
      if (arr.length === 0) {
        const seed = [
          {
            id: "model1",
            position: { x: -2, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            modelUrl: "/models/model1.glb",
          },
          {
            id: "model2",
            position: { x: 2, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            modelUrl: "/models/model2.glb",
          },
        ];
        for (const s of seed) await saveModelDoc(s.id, s);
        setModels(seed);
      } else {
        setModels(
          arr.map((a) => ({
            id: a.id,
            position: a.position || { x: 0, y: 0, z: 0 },
            rotation: a.rotation || { x: 0, y: 0, z: 0 },
            modelUrl: a.modelUrl || `/models/${a.id}.glb`,
          }))
        );
      }
    })();
  }, []);

  function handleTransformStart(id) {}

  function handleTransformEnd(id, state) {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...state } : m))
    );

    saveModelDoc(id, state);
  }

  function handleTransform(id, state) {
    debouncedSave(id, { position: state.position, rotation: state.rotation });
  }

  if (!models) return <div>Loading models...</div>;

  return (
    <>
      <div style={{ position: "absolute", zIndex: 10, left: 12, top: 12 }}>
        <button onClick={() => setView((v) => (v === "3d" ? "2d" : "3d"))}>
          Toggle view: {view === "3d" ? "3D" : "2D (top)"}
        </button>
      </div>

      <Canvas
        shadows
        onCreated={({ camera }) => {
          window.__APP_CAMERA__ = camera;
        }}
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ height: "100vh", width: "100vw" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <gridHelper args={[20, 20]} />
        {view === "3d" && (
          <>
            <PerspectiveCameraSetup />
            <OrbitControls
              ref={orbitRef}
              makeDefault
              enabled
              rotateSpeed={0.5}
            />
          </>
        )}

        {view === "2d" && (
          <>
            <TopDownCamera />
            <OrbitControls
              ref={orbitRef}
              enableRotate={false}
              enableZoom={true}
              enablePan={true}
              zoomSpeed={1}
              panSpeed={0.8}
              makeDefault
              zoomToCursor={true}
            />
          </>
        )}

        <Suspense fallback={null}>
          {models.map((m, idx) => (
            <ModelItem
              key={m.id}
              id={m.id}
              url={m.modelUrl}
              initial={{ position: m.position, rotation: m.rotation }}
              isTopDown={view === "2d"}
              otherBounds={otherBounds}
              onTransformStart={handleTransformStart}
              onTransformEnd={handleTransformEnd}
              onTransform={handleTransform}
            />
          ))}
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "absolute",
          zIndex: 11,
          right: 12,
          top: 12,
          background: "rgba(255,255,255,0.8)",
          padding: 8,
        }}
      >
        <h4>Rotations (manual)</h4>
        {models.map((m) => (
          <ModelControls
            key={m.id}
            model={m}
            onChange={async (newState) => {
              setModels((prev) =>
                prev.map((x) => (x.id === m.id ? { ...x, ...newState } : x))
              );
              await saveModelDoc(m.id, newState);
            }}
          />
        ))}
      </div>
    </>
  );
}

function ModelControls({ model, onChange }) {
  const [rx, setRx] = useState(model.rotation.x || 0);
  const [ry, setRy] = useState(model.rotation.y || 0);
  const [rz, setRz] = useState(model.rotation.z || 0);

  useEffect(() => {
    setRx(model.rotation.x);
    setRy(model.rotation.y);
    setRz(model.rotation.z);
  }, [model.rotation]);

  const updateRotation = (axis, value) => {
    const newRot = { x: rx, y: ry, z: rz, [axis]: value };

    if (axis === "x") setRx(value);
    if (axis === "y") setRy(value);
    if (axis === "z") setRz(value);

    onChange({ rotation: newRot, position: model.position });
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>{model.id}</strong>

      <div>
        X:
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={rx}
          onChange={(e) => updateRotation("x", parseFloat(e.target.value))}
        />
      </div>

      <div>
        Y:
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={ry}
          onChange={(e) => updateRotation("y", parseFloat(e.target.value))}
        />
      </div>

      <div>
        Z:
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={rz}
          onChange={(e) => updateRotation("z", parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
