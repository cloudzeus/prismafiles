import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || 'prismafiles/megaparking';
    
    console.log('🌐 CDN Browse API called for path:', path);
    
    // Try to get from cache first
    const cacheKey = `cdn:api:browse:${path}`;
    const cachedData = await cacheGet(cacheKey);
    
    if (cachedData && Date.now() - cachedData.lastUpdated < 60000) { // 1 minute cache for API
      console.log('📖 Using cached API response for:', path);
      return NextResponse.json(cachedData.data);
    }
    
    // Mock CDN data - replace with actual CDN API call
    const mockData = generateMockCDNData(path);
    
    // Cache the response
    await cacheSet(cacheKey, {
      data: mockData,
      lastUpdated: Date.now()
    }, 60); // 1 minute TTL
    
    console.log('💾 Cached CDN browse response for:', path);
    
    return NextResponse.json(mockData);
    
  } catch (error) {
    console.error('❌ CDN Browse API error:', error);
    return NextResponse.json(
      { error: 'Failed to browse CDN files' },
      { status: 500 }
    );
  }
}

function generateMockCDNData(path: string) {
  // Since megaparking folder is empty, show actual files or empty state
  if (path === 'prismafiles/megaparking') {
    return {
      items: [
        // Show the actual prismafiles.svg logo that exists
        { 
          name: 'prismafiles.svg', 
          type: 'file', 
          path: `${path}/prismafiles.svg`, 
          size: 25600, 
          modified: '2024-01-15' 
        }
      ],
      totalItems: 1,
      currentPath: path
    };
  }

  // For any subfolder paths, return empty since they don't exist
  return {
    items: [],
    totalItems: 0,
    currentPath: path
  };
}
