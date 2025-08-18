"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FileTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

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

  // Ensure all data is valid
  useEffect(() => {
    setFileTypes(prev => prev.map(item => ({
      ...item,
      count: item.count || 0,
      percentage: item.percentage || 0
    })));
    setTotalFiles(prev => prev || 0);
    setIsLoading(false);
  }, []);

  // Mock data - in real implementation, fetch from BunnyCDN API
  useEffect(() => {
    // TODO: Replace with actual BunnyCDN API call
    // const fetchFileTypes = async () => {
    //   const response = await fetch('/api/cdn/file-types');
    //   const data = await response.json();
    //   setFileTypes(data);
    // };
    // fetchFileTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Pie Chart Visualization */}
      <div className="flex-1 flex items-center justify-center">
        {fileTypes.length > 0 ? (
          <div className="relative w-48 h-48">
            {/* SVG Pie Chart */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {fileTypes.map((fileType, index) => {
                const previousPercentages = fileTypes
                  .slice(0, index)
                  .reduce((sum, item) => sum + (item.percentage || 0), 0);
                
                const startAngle = (previousPercentages / 100) * 360;
                const endAngle = ((previousPercentages + (fileType.percentage || 0)) / 100) * 360;
                
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = (fileType.percentage || 0) > 50 ? 1 : 0;
                
                return (
                  <path
                    key={fileType.type}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={fileType.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{totalFiles || 0}</div>
                <div className="text-xs text-gray-500">Total Files</div>
              </div>
            </div>
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
