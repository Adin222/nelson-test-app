"use client";

import { useCallback, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { saveModelDoc, loadAllModels } from "../lib/firebase";
import debounce from "lodash.debounce";

export const TopDownCamera = () => {
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
};

export const PerspectiveCameraSetup = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
};

export const useModelHandlers = (setModels) => {
  const debouncedSave = useCallback(
    debounce(async (id, data) => {
      await saveModelDoc(id, data);
    }, 300),
    []
  );

  const handleTransformStart = (id) => {};

  const handleTransform = (id, state) => {
    debouncedSave(id, { position: state.position, rotation: state.rotation });
  };

  const handleTransformEnd = useCallback(
    (id, state) => {
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...state } : m))
      );
      saveModelDoc(id, state);
    },
    [setModels]
  );

  const fetchModels = useCallback(async () => {
    try {
      const arr = await loadAllModels();
      const normalized = arr.map((a) => ({
        id: a.id,
        position: a.position || { x: 0, y: 0, z: 0 },
        rotation: a.rotation || { x: 0, y: 0, z: 0 },
        modelUrl: a.modelUrl || `/models/${a.id}.glb`,
      }));
      setModels(normalized);
    } catch (err) {
      console.error("Error loading models:", err);
    }
  }, [setModels]);

  const handleModelChange = async (modelId, newState, setModels) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, ...newState } : m))
    );
    await saveModelDoc(modelId, newState);
  };

  return {
    handleModelChange,
    handleTransformStart,
    handleTransform,
    handleTransformEnd,
    fetchModels,
  };
};
