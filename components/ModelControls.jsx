"use client";

import { useState, useEffect } from "react";

export default function ModelControls({ model, onChange }) {
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
