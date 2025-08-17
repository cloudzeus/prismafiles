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

  useEffect(() => {
    // Calculate percentage
    const calculatedPercentage = Math.round((data.scanned / data.total) * 100);
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

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Radial Progress Chart */}
      <div className="relative">
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
        
        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
            <div className="text-sm text-gray-600">Scanned</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4 w-full">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{data.scanned}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{data.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{data.failed}</div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>
      </div>

      {/* Total Count */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">Total Documents</div>
        <div className="text-xl font-bold text-gray-900">{data.total}</div>
      </div>
    </div>
  );
}
