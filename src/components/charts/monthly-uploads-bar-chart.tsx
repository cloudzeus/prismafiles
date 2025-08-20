"use client";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeeklyUploadData {
  day: string;
  count: number;
  date: string;
}

export default function WeeklyUploadsBarChart() {
  const [uploads, setUploads] = useState<WeeklyUploadData[]>([]);
  const [maxUploads, setMaxUploads] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock data for current week (7 days)
    const generateMockData = () => {
      const mockData: WeeklyUploadData[] = [];
      let maxCount = 0;
      
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const count = Math.floor(Math.random() * 25) + 5; // Random between 5-30
        maxCount = Math.max(maxCount, count);
        
        mockData.push({
          day: daysOfWeek[i],
          count,
          date: daysOfWeek[i]
        });
      }
      
      setUploads(mockData);
      setMaxUploads(Math.max(1, maxCount)); // Ensure maxUploads is at least 1
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchUploads = async () => {
  //     const response = await fetch('/api/uploads/weekly');
  //     const data = await response.json();
  //     setUploads(data);
  //   };
  //   fetchUploads();
  // }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full flex flex-col">
        {/* Chart Title */}
        <div className="text-center mb-4">
          <div className="text-sm text-gray-500">Current Week</div>
          <div className="text-lg font-semibold text-gray-900">Weekly Uploads</div>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 flex items-end justify-between gap-2 px-2">
          {uploads.length > 0 ? uploads.map((upload, index) => {
            const height = maxUploads > 0 ? (upload.count / maxUploads) * 100 : 0;
            const isToday = new Date().getDay() === index;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-full">
                      <div
                        className={`w-full transition-all duration-500 ease-out cursor-pointer ${
                          isToday ? 'bg-purple-600' : 'bg-purple-400'
                        } rounded-t-sm hover:bg-purple-500`}
                        style={{ height: `${Math.max(0, height)}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-semibold">{upload.count} files uploaded</div>
                      <div className="text-xs text-gray-300">{upload.day}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                
                {/* Day Label */}
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {upload.day}
                </div>
              </div>
            );
          }) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-lg">No data available</div>
              </div>
            </div>
          )}
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
    </TooltipProvider>
  );
}
