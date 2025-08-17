import { NextRequest, NextResponse } from 'next/server';

interface CDNFile {
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  ServerId: number;
  ArrayNumber: number;
  P2PHash: string;
  Replication: number;
  StreamCount: number;
  MetaData: Record<string, string>;
}

interface CDNResponse {
  success: boolean;
  data?: CDNFile[];
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    
    // BunnyCDN Storage API endpoint
    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'kolleris';
    const baseUrl = process.env.BUNNY_STORAGE_URL || 'https://kolleris.b-cdn.net';
    
    // Construct the full API URL - BunnyCDN Storage API expects the full path
    const fullPath = path || '';
    const apiUrl = `https://storage.bunnycdn.com/${storageZone}/${fullPath}`;
    
    console.log('BunnyCDN API Request:', {
      storageZone,
      path: fullPath,
      apiUrl,
      baseUrl
    });
    
    // Using your configured BunnyCDN credentials
    const apiKey = process.env.BUNNY_ACCESS_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BunnyCDN API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'AccessKey': apiKey,
        'Accept': 'application/json',
      },
      // Add caching to improve performance
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BunnyCDN API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorText
      });
      
      if (response.status === 404) {
        // Try to list the parent directory to see what's available
        const parentPath = fullPath.split('/').slice(0, -1).join('/');
        if (parentPath !== fullPath) {
          console.log('Trying parent directory:', parentPath);
          const parentApiUrl = `https://storage.bunnycdn.com/${storageZone}/${parentPath}`;
          
          try {
            const parentResponse = await fetch(parentApiUrl, {
              method: 'GET',
              headers: {
                'AccessKey': apiKey,
                'Accept': 'application/json',
              },
            });
            
            if (parentResponse.ok) {
              const parentData = await parentResponse.json();
              const missingFolder = fullPath.split('/').pop();
              
              return NextResponse.json({
                success: false,
                error: `Folder '${missingFolder}' not found in '${parentPath}'.`,
                suggestion: `Available items in parent folder: ${parentData.length} files/folders.`,
                parentPath,
                availableCount: parentData.length,
                availableItems: parentData.slice(0, 10).map((item: any) => ({
                  name: item.ObjectName.split('/').pop(),
                  isDirectory: item.IsDirectory,
                  type: item.IsDirectory ? 'folder' : 'file'
                }))
              });
            }
          } catch (parentError) {
            console.error('Parent directory check failed:', parentError);
          }
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Folder not found: ${fullPath}. Please check if the folder exists in your storage zone.` 
          },
          { status: 404 }
        );
      }
      
      throw new Error(`BunnyCDN API error: ${response.status} - ${errorText}`);
    }

    const data: CDNFile[] = await response.json();
    
    // Transform the data to include full URLs and better formatting
    const transformedData = data.map(file => ({
      ...file,
      fullUrl: `${baseUrl}/${storageZone}/${file.ObjectName}`,
      displayName: file.ObjectName.split('/').pop() || file.ObjectName,
      size: file.IsDirectory ? null : formatFileSize(file.Length),
      lastModified: new Date(file.LastChanged).toLocaleDateString(),
      isDirectory: file.IsDirectory,
    }));

    // Set cache headers for better performance
    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    responseHeaders.set('CDN-Cache-Control', 'public, max-age=300');
    responseHeaders.set('Vercel-CDN-Cache-Control', 'public, max-age=300');

    return NextResponse.json({
      success: true,
      data: transformedData,
      currentPath: path,
      baseUrl: `${baseUrl}/${storageZone}`,
      timestamp: new Date().toISOString(),
      cacheInfo: 'Cached for 5 minutes, stale-while-revalidate for 10 minutes'
    }, {
      headers: responseHeaders
    });

  } catch (error) {
    console.error('BunnyCDN API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CDN contents' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
