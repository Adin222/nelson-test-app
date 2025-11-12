"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import ThreeScene from "@/components/ThreeScene"


export default function Page() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Suspense fallback={<div>Loading 3D...</div>}>
        <ThreeScene />
      </Suspense>
    </div>
  );
}
