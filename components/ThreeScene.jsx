"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

//Helper components
import ModelItem from "@/components/ModelItem";
import ModelControls from "./ModelControls";

//Custom hooks
import {
  useModelHandlers,
  PerspectiveCameraSetup,
  TopDownCamera,
} from "../hooks/useModelHandlers";

export default function ThreeScene() {
  const [models, setModels] = useState(null);
  const [view, setView] = useState("3d");
  const otherBounds = useRef([]);
  const orbitRef = useRef();

  const {
    handleModelChange,
    handleTransform,
    handleTransformStart,
    handleTransformEnd,
    fetchModels,
  } = useModelHandlers(setModels);

  useEffect(() => {
    const camera = window.__APP_CAMERA__;
    if (!orbitRef.current || !camera) return;

    orbitRef.current.target.set(0, 0, 0);

    if (view === "3d") camera.up.set(0, 1, 0);
    else if (view === "2d") camera.up.set(0, 0, -1);

    orbitRef.current.update();
  }, [view]);

  useEffect(() => {
    fetchModels();
  }, []);

  if (!models) return <div>Loading models...</div>;

  return (
    <React.Fragment>
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
              enableZoom={false}
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
            onChange={(newState) =>
              handleModelChange(m.id, newState, setModels)
            }
          />
        ))}
      </div>
    </React.Fragment>
  );
}
