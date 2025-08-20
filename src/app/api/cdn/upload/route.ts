import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderPath = formData.get('folderPath') as string;
    const pathsJson = formData.get('paths') as string | null;
    const relativePaths = pathsJson ? (JSON.parse(pathsJson) as string[]) : null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.BUNNY_ACCESS_KEY;
    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'kolleris';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BunnyCDN not configured' },
        { status: 500 }
      );
    }

    const uploadedFiles: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fileName = file.name;
        // If relative paths provided (from folder upload), nest under folderPath
        const rel = relativePaths && relativePaths[i] ? relativePaths[i] : fileName;
        const safeRel = rel.replace(/^\/+/, '');
        const filePath = `${folderPath}/${safeRel}`;
        const uploadUrl = `https://storage.bunnycdn.com/${storageZone}/${filePath}`;
        
        console.log(`Uploading file: ${fileName} to ${filePath}`);
        
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: buffer
        });

        if (response.ok) {
          uploadedFiles.push({
            name: fileName,
            path: filePath,
            size: file.size,
            type: file.type
          });
          console.log(`Successfully uploaded: ${fileName}`);
        } else {
          const errorText = await response.text();
          console.error(`Failed to upload ${fileName}:`, response.status, errorText);
          errors.push({
            name: fileName,
            error: `Upload failed: ${response.status} ${errorText}`
          });
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push({
          name: file.name,
          error: `Upload error: ${error}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploadedFiles,
      errors,
      totalUploaded: uploadedFiles.length,
      totalErrors: errors.length
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
