'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FileUploadProps {
  currentPath: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUpload({ currentPath, onUploadComplete, onClose }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadFile = useCallback(async (uploadFile: UploadFile, index: number) => {
    if (uploadFile.status === 'uploading') return;

    setUploadFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('path', currentPath);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, status: 'completed', progress: 100 } : f
          ));
          toast.success(`${uploadFile.file.name} uploaded successfully`);
        } else {
          throw new Error(`Upload failed: ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        setUploadFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'error', error: 'Network error' } : f
        ));
        toast.error(`Failed to upload ${uploadFile.file.name}`);
      });

      xhr.open('POST', '/api/cdn/upload');
      xhr.send(formData);

    } catch (error) {
      setUploadFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: 'Upload failed' } : f
      ));
      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  }, [currentPath]);

  const startAllUploads = useCallback(() => {
    uploadFiles.forEach((file, index) => {
      if (file.status === 'pending') {
        uploadFile(file, index);
      }
    });
  }, [uploadFiles, uploadFile]);

  const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
  const hasPendingFiles = uploadFiles.some(f => f.status === 'pending');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Files</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Drop files here</p>
            <p className="text-gray-600 mb-4">or click to select files</p>
            <Button onClick={() => document.getElementById('file-input')?.click()}>
              Select Files
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Files to Upload</h3>
                <div className="flex items-center space-x-2">
                  {hasPendingFiles && (
                    <Button onClick={startAllUploads} size="sm">
                      Start All
                    </Button>
                  )}
                  <span className="text-sm text-gray-600">
                    {completedCount}/{uploadFiles.length} completed
                  </span>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploadFiles.map((fileItem, index) => (
                  <div
                    key={`${fileItem.file.name}-${index}`}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {fileItem.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : fileItem.status === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress 
                          value={fileItem.progress} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {fileItem.progress}%
                        </span>
                      </div>
                      {fileItem.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileItem.error}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {fileItem.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => uploadFile(fileItem, index)}
                        >
                          Upload
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {uploadFiles.length > 0 && (
              <Button 
                onClick={() => {
                  onUploadComplete();
                  onClose();
                }}
                disabled={!uploadFiles.every(f => f.status === 'completed')}
              >
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
