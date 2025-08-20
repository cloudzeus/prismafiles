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

interface WeeklyUploadData {
  day: string;
  count: number;
  date: string;
}

const chartConfig = {
  uploads: {
    label: "File Uploads",
    color: "#8B5CF6",
  },
};

export default function WeeklyUploadsBarChart() {
  const [uploads, setUploads] = useState<WeeklyUploadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for current week (7 days)
    const generateMockData = () => {
      const mockData: WeeklyUploadData[] = [];
      
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const count = Math.floor(Math.random() * 25) + 5; // Random between 5-30
        
        mockData.push({
          day: daysOfWeek[i],
          count,
          date: daysOfWeek[i]
        });
      }
      
      setUploads(mockData);
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

  const chartData = uploads.map((upload, index) => ({
    name: upload.day,
    uploads: upload.count,
    isToday: new Date().getDay() === index,
  }));

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Title */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500">Current Week</div>
        <div className="text-lg font-semibold text-gray-900">Weekly Uploads</div>
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
                dataKey="uploads"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-purple-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {uploads.reduce((sum, upload) => sum + (upload.count || 0), 0)}
          </div>
          <div className="text-xs text-gray-500">Total Uploads</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {uploads.length > 0 ? Math.round(uploads.reduce((sum, upload) => sum + (upload.count || 0), 0) / uploads.length) : 0}
          </div>
          <div className="text-xs text-gray-500">Daily Average</div>
        </div>
      </div>
    </div>
  );
}
