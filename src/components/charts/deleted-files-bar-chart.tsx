"use client";
import { useState, useEffect } from "react";

interface DeletedFileData {
  period: string;
  count: number;
  date: string;
}

export default function DeletedFilesBarChart() {
  const [deletedFiles, setDeletedFiles] = useState<DeletedFileData[]>([]);
  const [maxDeleted, setMaxDeleted] = useState(0);

  useEffect(() => {
    // Generate mock data for the last 30 days
    const generateMockData = () => {
      const mockData: DeletedFileData[] = [];
      let maxCount = 0;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const count = Math.floor(Math.random() * 15) + 1; // Random between 1-16
        maxCount = Math.max(maxCount, count);
        
        mockData.push({
          period: date.getDate().toString(),
          count,
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
      }
      
      setDeletedFiles(mockData);
      setMaxDeleted(maxCount);
    };

    generateMockData();
  }, []);

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   const fetchDeletedFiles = async () => {
  //     const response = await fetch('/api/files/deleted');
  //     const data = await response.json();
  //     setDeletedFiles(data);
  //   };
  //   fetchDeletedFiles();
  // }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Title */}
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500">Last 30 Days</div>
        <div className="text-lg font-semibold text-gray-900">Deleted Files</div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 flex items-end justify-between gap-1 px-2">
        {deletedFiles.map((deleted, index) => {
          const height = maxDeleted > 0 ? (deleted.count / maxDeleted) * 100 : 0;
          const isToday = index === deletedFiles.length - 1;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Bar */}
              <div className="relative w-full">
                <div
                  className={`w-full transition-all duration-500 ease-out ${
                    isToday ? 'bg-red-600' : 'bg-red-400'
                  } rounded-t-sm hover:bg-red-500`}
                  style={{ height: `${height}%` }}
                />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {deleted.count} deleted
                </div>
              </div>
              
              {/* Period Label */}
              <div className="text-xs text-gray-600 mt-1 text-center">
                {deleted.period}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-red-600">
            {deletedFiles.reduce((sum, deleted) => sum + deleted.count, 0)}
          </div>
          <div className="text-xs text-gray-500">Total Deleted</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {Math.round(deletedFiles.reduce((sum, deleted) => sum + deleted.count, 0) / deletedFiles.length)}
          </div>
          <div className="text-xs text-gray-500">Daily Average</div>
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
