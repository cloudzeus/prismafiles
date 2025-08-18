"use client";
import { useState, useEffect } from "react";

interface ScannedDocumentData {
  total: number;
  scanned: number;
  pending: number;
  failed: number;
}

export default function ScannedDocumentsRadialChart() {
  const [data, setData] = useState<ScannedDocumentData>({
    total: 150,
    scanned: 108,
    pending: 32,
    failed: 10
  });

  const [percentage, setPercentage] = useState(72);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure all data is valid
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
    // Calculate percentage
    const calculatedPercentage = data.total > 0 ? Math.round((data.scanned / data.total) * 100) : 0;
    setPercentage(calculatedPercentage);
  }, [data]);

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchData = async () => {
    //   const response = await fetch('/api/documents/scanning-status');
    //   const result = await response.json();
    //   setData(result);
    // };
    // fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - ((percentage || 0) / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Radial Progress Chart */}
      <div className="relative">
        {data.total > 0 && percentage >= 0 ? (
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="transparent"
            />
            
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#10B981"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-lg">No data available</div>
            </div>
          </div>
        )}
        
        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{percentage || 0}%</div>
            <div className="text-sm text-gray-600">Scanned</div>
          </div>
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
