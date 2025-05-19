"use client";

import { useState } from "react";
import CylinderFlowGraph from "@/components/CylinderFlowGraph";

export default function Home() {
  const [panels, setPanels] = useState<number>(8);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Cylinder Flow Simulation (Source Panel Method) by 이대한
      </h1>

      <div className="flex items-center gap-4 mb-8">
        <label htmlFor="panels" className="text-gray-700 font-medium">
          Number of Panels:
        </label>
        <input
          id="panels"
          type="number"
          min={4}
          value={panels}
          onChange={(e) => setPanels(parseInt(e.target.value, 10))}
          className="border border-gray-300 rounded p-2 w-24"
        />
      </div>

      <CylinderFlowGraph panels={panels} />
    </main>
  );
}
