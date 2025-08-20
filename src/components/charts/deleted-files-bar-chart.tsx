"use client";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DeletedFileData {
  period: string;
  count: number;
  date: string;
  weekStart: string;
}

const chartConfig = {
  deleted: {
    label: "Deleted Files",
    color: "#EF4444",
  },
};

export default function DeletedFilesBarChart() {
  const [deletedFiles, setDeletedFiles] = useState<DeletedFileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for the last 4 weeks (weekly basis)
    const generateMockData = () => {
      const mockData: DeletedFileData[] = [];
      
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        
        // Get the start of the week (Sunday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        
        const count = Math.floor(Math.random() * 50) + 10; // Random between 10-60
        
        mockData.push({
          period: `Week ${4 - i}`,
          count,
          date: weekStart.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          weekStart: weekStart.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      
      setDeletedFiles(mockData);
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const chartData = deletedFiles.map((deleted, index) => ({
    name: deleted.period,
    deleted: deleted.count,
    weekStart: deleted.weekStart,
    isCurrentWeek: index === deletedFiles.length - 1,
  }));

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Title */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500">Last 4 Weeks</div>
        <div className="text-lg font-semibold text-gray-900">Deleted Files</div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip />
              <Bar
                dataKey="deleted"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-red-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-red-600">
            {deletedFiles.reduce((sum, deleted) => sum + (deleted.count || 0), 0)}
          </div>
          <div className="text-xs text-gray-500">Total Deleted</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {deletedFiles.length > 0 ? Math.round(deletedFiles.reduce((sum, deleted) => sum + (deleted.count || 0), 0) / deletedFiles.length) : 0}
          </div>
          <div className="text-xs text-gray-500">Weekly Average</div>
        </div>
      </div>

      {/* Warning Note */}
      <div className="mt-3 text-center">
        <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
          ⚠️ Files are permanently deleted
        </div>
      </div>
    </div>
  );
}
