'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FolderOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GenerateFoldersButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleGenerateFolders = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/cdn/generate-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success(result.message || 'Folders generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate folders');
      }
    } catch (error) {
      console.error('Error generating folders:', error);
      toast.error('An error occurred while generating folders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerateFolders}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FolderOpen className="h-4 w-4 mr-2" />
            Generate Members Folders
          </>
        )}
      </Button>

      {lastResult && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {lastResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="font-medium">
              {lastResult.success ? 'Success' : 'Completed with warnings'}
            </span>
          </div>

          {lastResult.summary && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {lastResult.summary.totalDepartments}
                </Badge>
                <span>Departments</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {lastResult.summary.totalUsers}
                </Badge>
                <span>Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {lastResult.summary.createdDepartments + lastResult.summary.createdUsers}
                </Badge>
                <span>Created</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  {lastResult.summary.existingDepartments + lastResult.summary.existingUsers}
                </Badge>
                <span>Existing</span>
              </div>
            </div>
          )}

          {lastResult.errors && lastResult.errors.length > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
              <div className="font-medium mb-1">Errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {lastResult.errors.slice(0, 3).map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
                {lastResult.errors.length > 3 && (
                  <li>...and {lastResult.errors.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
