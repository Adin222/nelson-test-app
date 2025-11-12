"use client";

import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { useGLTF, TransformControls } from "@react-three/drei";

let activeTransformControl = { current: null };

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
  const lastValidPos = useRef(
    new THREE.Vector3(
      initial.position.x,
      initial.position.y,
      initial.position.z
    )
  );

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
    lastValidPos.current.copy(meshRef.current.position);
  }, [initial]);

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

  useEffect(() => {
    const ctrl = transformRef.current;
    const mesh = meshRef.current;
    if (!ctrl || !mesh) return;

    ctrl.attach(mesh);

    const onDraggingChanged = (e) => {
      const isDragging = !!e.value;

      if (isDragging) {
        if (
          activeTransformControl.current &&
          activeTransformControl.current !== ctrl
        ) {
          try {
            activeTransformControl.current.detach();
          } catch (err) {}
        }
        activeTransformControl.current = ctrl;
        onTransformStart(id);
      } else {
        if (activeTransformControl.current === ctrl) {
          const pos = mesh.position;
          const rot = mesh.rotation;
          onTransformEnd(
            id,
            {
              position: { x: pos.x, y: pos.y, z: pos.z },
              rotation: { x: rot.x, y: rot.y, z: rot.z },
            },
            false
          );
          activeTransformControl.current = null;
        }
      }
    };

    const handleChange = () => {
      if (!meshRef.current || activeTransformControl.current !== ctrl) return;

      const mode = ctrl.getMode ? ctrl.getMode() : "translate";

      if (mode === "translate") {
        const collision = checkCollision(meshRef.current.position);
        if (collision) meshRef.current.position.copy(lastValidPos.current);
        else lastValidPos.current.copy(meshRef.current.position);
      }

      onTransform(id, {
        position: {
          x: meshRef.current.position.x,
          y: meshRef.current.position.y,
          z: meshRef.current.position.z,
        },
        rotation: {
          x: meshRef.current.rotation.x,
          y: meshRef.current.rotation.y,
          z: meshRef.current.rotation.z,
        },
      });
    };

    ctrl.addEventListener("dragging-changed", onDraggingChanged);
    ctrl.addEventListener("objectChange", handleChange);

    return () => {
      try {
        ctrl.removeEventListener("dragging-changed", onDraggingChanged);
      } catch {}
      try {
        ctrl.removeEventListener("objectChange", handleChange);
      } catch {}
      try {
        ctrl.detach();
      } catch {}
      if (activeTransformControl.current === ctrl)
        activeTransformControl.current = null;
    };
  }, [id, onTransformStart, onTransformEnd, onTransform, otherBounds]);

  const checkCollision = (pos) => {
    if (!meshRef.current) return false;
    const tempBox = new THREE.Box3().setFromObject(meshRef.current);
    tempBox.translate(
      new THREE.Vector3().subVectors(pos, meshRef.current.position)
    );

    for (const key in otherBounds.current) {
      if (key === id) continue;
      const ob = otherBounds.current[key];
      if (ob && tempBox.intersectsBox(ob)) return true;
    }
    return false;
  };

  const handleDoubleClick = () => {
    const ctrl = transformRef.current;
    if (!ctrl) return;
    const currentMode = ctrl.getMode ? ctrl.getMode() : "translate";
    const newMode = currentMode === "translate" ? "rotate" : "translate";
    ctrl.setMode(newMode);
  };

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
      <group ref={meshRef} onDoubleClick={handleDoubleClick}>
        <primitive object={sceneClone} />
      </group>
    </TransformControls>
  );
}
