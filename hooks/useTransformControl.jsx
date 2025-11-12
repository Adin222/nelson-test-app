"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { handleDraggingChanged, handleObjectChange } from "../utils/utils";

let activeTransformControl = { current: null };

export const useTransformControl = ({
  id,
  meshRef,
  transformRef,
  otherBounds,
  onTransformStart,
  onTransformEnd,
  onTransform,
}) => {
  const lastValidPos = useRef(new THREE.Vector3());

  useEffect(() => {
    const mesh = meshRef.current;
    const ctrl = transformRef.current;
    if (!mesh || !ctrl) return;

    ctrl.attach(mesh);

    const draggingListener = (e) =>
      handleDraggingChanged({
        e,
        ctrl,
        activeTransformControl,
        id,
        onTransformStart,
        onTransformEnd,
        meshRef,
      });

    const objectChangeListener = () =>
      handleObjectChange({
        meshRef,
        ctrl,
        activeTransformControl,
        lastValidPos,
        id,
        otherBounds,
        onTransform,
      });

    ctrl.addEventListener("dragging-changed", draggingListener);
    ctrl.addEventListener("objectChange", objectChangeListener);

    return () => {
      try {
        ctrl.removeEventListener("dragging-changed", draggingListener);
      } catch {}
      try {
        ctrl.removeEventListener("objectChange", objectChangeListener);
      } catch {}
      try {
        ctrl.detach();
      } catch {}
      if (activeTransformControl.current === ctrl)
        activeTransformControl.current = null;
    };
  }, [
    id,
    meshRef,
    transformRef,
    otherBounds,
    onTransformStart,
    onTransformEnd,
    onTransform,
  ]);
};
