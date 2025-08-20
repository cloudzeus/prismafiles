"use client";
import { useState, useEffect } from "react";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ScannedDocumentData {
  total: number;
  scanned: number;
  pending: number;
  failed: number;
}

const chartConfig = {
  scanned: {
    label: "Scanned Documents",
    color: "#10B981",
  },
  pending: {
    label: "Pending Documents",
    color: "#F59E0B",
  },
  failed: {
    label: "Failed Documents",
    color: "#EF4444",
  },
};

export default function ScannedDocumentsRadialChart() {
  const [data, setData] = useState<ScannedDocumentData>({
    total: 150,
    scanned: 108,
    pending: 32,
    failed: 10
  });

  const [percentage, setPercentage] = useState(72);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setData(prev => ({
      total: prev.total || 0,
      scanned: prev.scanned || 0,
      pending: prev.pending || 0,
      failed: prev.failed || 0
    }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const calculatedPercentage = data.total > 0 ? Math.round((data.scanned / data.total) * 100) : 0;
    setPercentage(calculatedPercentage);
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const chartData = [
    {
      name: "scanned",
      value: data.scanned,
      fill: "#10B981",
    },
    {
      name: "pending",
      value: data.pending,
      fill: "#F59E0B",
    },
    {
      name: "failed",
      value: data.failed,
      fill: "#EF4444",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={30}
                fill="#8884d8"
              />
              <ChartTooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{percentage || 0}%</div>
          <div className="text-sm text-gray-600">Scanned</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4 w-full">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{data.scanned || 0}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{data.pending || 0}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{data.failed || 0}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>

      {/* Total Count */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">Total Documents</div>
        <div className="text-xl font-bold text-gray-900">{data.total || 0}</div>
      </div>
    </div>
  );
}
