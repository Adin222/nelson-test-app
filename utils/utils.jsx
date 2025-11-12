import * as THREE from "three";

export const checkCollision = (meshRef, pos, otherBounds, id) => {
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

export const getTransformData = (meshRef) => {
  const pos = meshRef.current.position;
  const rot = meshRef.current.rotation;
  return {
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z },
  };
};

export const handleDraggingChanged = ({
  e,
  ctrl,
  activeTransformControl,
  id,
  onTransformStart,
  onTransformEnd,
  meshRef,
}) => {
  const isDragging = !!e.value;
  if (isDragging) {
    if (
      activeTransformControl.current &&
      activeTransformControl.current !== ctrl
    ) {
      try {
        activeTransformControl.current.detach();
      } catch {}
    }
    activeTransformControl.current = ctrl;
    onTransformStart(id);
  } else {
    if (activeTransformControl.current === ctrl) {
      onTransformEnd(id, getTransformData(meshRef), false);
      activeTransformControl.current = null;
    }
  }
};

export const handleObjectChange = ({
  meshRef,
  ctrl,
  activeTransformControl,
  lastValidPos,
  id,
  otherBounds,
  onTransform,
}) => {
  if (!meshRef.current || activeTransformControl.current !== ctrl) return;

  const mode = ctrl.getMode ? ctrl.getMode() : "translate";

  if (mode === "translate") {
    const collision = checkCollision(
      meshRef,
      meshRef.current.position,
      otherBounds,
      id
    );
    if (collision) meshRef.current.position.copy(lastValidPos.current);
    else lastValidPos.current.copy(meshRef.current.position);
  }

  onTransform(id, getTransformData(meshRef));
};
