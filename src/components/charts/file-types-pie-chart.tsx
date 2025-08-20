"use client";
import { useState, useEffect } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FileTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

const chartConfig = {
  PDF: {
    label: "PDF Files",
    color: "#3B82F6",
  },
  Images: {
    label: "Image Files",
    color: "#10B981",
  },
  Documents: {
    label: "Document Files",
    color: "#8B5CF6",
  },
  Videos: {
    label: "Video Files",
    color: "#F59E0B",
  },
  Others: {
    label: "Other Files",
    color: "#EF4444",
  },
};

export default function FileTypesPieChart() {
  const [fileTypes, setFileTypes] = useState<FileTypeData[]>([
    { type: "PDF", count: 45, percentage: 35, color: "#3B82F6" },
    { type: "Images", count: 38, percentage: 29, color: "#10B981" },
    { type: "Documents", count: 25, percentage: 19, color: "#8B5CF6" },
    { type: "Videos", count: 15, percentage: 12, color: "#F59E0B" },
    { type: "Others", count: 7, percentage: 5, color: "#EF4444" }
  ]);

  const [totalFiles, setTotalFiles] = useState(130);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFileTypes(prev => prev.map(item => ({
      ...item,
      count: item.count || 0,
      percentage: item.percentage || 0
    })));
    setTotalFiles(prev => prev || 0);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const chartData = fileTypes.map(fileType => ({
    name: fileType.type,
    value: fileType.count,
    color: fileType.color,
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {fileTypes.length > 0 ? (
          <div className="w-full h-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-lg">No data available</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {fileTypes.map((fileType) => (
          <div key={fileType.type} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: fileType.color }}
              />
              <span className="font-medium">{fileType.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{fileType.count}</span>
              <span className="text-gray-400">({fileType.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
