"use client";

import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { useGLTF, TransformControls } from "@react-three/drei";
import { useTransformControl } from "../hooks/useTransformControl";

export default function ModelItem({
  id,
  url,
  initial,
  otherBounds,
  onTransformStart,
  onTransformEnd,
  onTransform,
}) {
  const gltf = useGLTF(url);
  const meshRef = useRef();
  const transformRef = useRef();

  const sceneClone = useMemo(() => {
    if (!gltf?.scene) return null;
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) child.material = child.material.clone();
      }
    });
    return clone;
  }, [gltf]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(
      initial.position.x,
      initial.position.y,
      initial.position.z
    );
    meshRef.current.rotation.set(
      initial.rotation.x,
      initial.rotation.y,
      initial.rotation.z
    );
  }, [initial]);

  // Collisions
  useEffect(() => {
    let raf;
    const update = () => {
      if (meshRef.current) {
        const box = new THREE.Box3().setFromObject(meshRef.current);
        otherBounds.current[id] = box.clone();
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      delete otherBounds.current[id];
    };
  }, [id, otherBounds]);

  //Hook for TransformControls logic
  useTransformControl({
    id,
    meshRef,
    transformRef,
    otherBounds,
    onTransformStart,
    onTransformEnd,
    onTransform,
  });

  if (!sceneClone) return null;

  return (
    <TransformControls
      ref={transformRef}
      mode="translate"
      enabled={true}
      rotationSnap={0.1}
      translationSnap={0.1}
      onMouseDown={() => onTransformStart(id)}
      onMouseUp={() => {
        if (!meshRef.current) return;
        const pos = meshRef.current.position;
        const rot = meshRef.current.rotation;
        onTransformEnd(
          id,
          {
            position: { x: pos.x, y: pos.y, z: pos.z },
            rotation: { x: rot.x, y: rot.y, z: rot.z },
          },
          false
        );
      }}
    >
      <group ref={meshRef}>
        <primitive object={sceneClone} />
      </group>
    </TransformControls>
  );
}
