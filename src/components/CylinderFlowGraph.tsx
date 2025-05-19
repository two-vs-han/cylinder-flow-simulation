"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";
import { solvePanelMethod } from "./sourcePanelMethod";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

interface Props {
  panels: number;
}

const CylinderFlowGraph = ({ panels: N }: Props) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[] | { x: number; y: number }[];
      borderWidth: number;
      borderColor: string;
      borderDash?: number[];
      fill: boolean;
      pointRadius?: number;
      pointStyle?: string;
      showLine?: boolean;
    }[];
  } | null>(null);
  const U_inf = 1;

  useEffect(() => {
    const panels = solvePanelMethod(U_inf, N);

    // Analytical Solution
    const theta = Array.from({ length: 361 }, (_, i) => (i * Math.PI) / 180);
    const cpAnalytic = theta.map((t) => 1 - 4 * Math.sin(t) ** 2);

    setChartData({
      labels: theta.map((t) => ((t * 180) / Math.PI).toFixed(0) + "°"),
      datasets: [
        {
          label: "Analytical Cp",
          data: theta.map((t, i) => ({
            x: (t * 180) / Math.PI,
            y: cpAnalytic[i],
          })),
          borderWidth: 2,
          borderColor: "#3b82f6",
          fill: false,
          pointRadius: 0,
          showLine: true,
        },
        {
          label: "Numerical Cp (Source Panel)",
          data: panels.map((p) => ({
            x:
              ((p.theta + Math.PI / 2 >= 0
                ? p.theta + Math.PI / 2
                : p.theta + Math.PI / 2 + 2 * Math.PI) *
                180) /
              Math.PI,
            y: p.cp,
          })),
          borderWidth: 1,
          borderColor: "#ef4444",
          borderDash: [5, 5],
          fill: false,
          pointStyle: "triangle",
          pointRadius: 6,
          showLine: false,
        },
      ],
    });
  }, [N]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      y: {
        title: { display: true, text: "Pressure Coefficient (Cp)" },
      },
      x: {
        type: "linear" as const,
        title: { display: true, text: "Angle (°)" },
        min: 0,
        max: 360,
        ticks: { maxTicksLimit: 10 },
      },
    },
  };

  return (
    <div className="h-[500px] bg-white shadow rounded-lg p-4">
      {chartData && (
        <Line
          data={chartData}
          options={{
            ...options,
            plugins: {
              legend: {
                position: "top" as const,
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default CylinderFlowGraph;
