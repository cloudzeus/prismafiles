import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet, cacheDelete, cacheClear } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }
    
    const value = await cacheGet(key);
    
    return NextResponse.json({
      success: true,
      key,
      value,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis cache GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl = 3600 } = body;
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }
    
    const success = await cacheSet(key, value, ttl);
    
    return NextResponse.json({
      success,
      key,
      ttl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis cache POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const clearAll = searchParams.get('clearAll') === 'true';
    
    if (clearAll) {
      const success = await cacheClear();
      return NextResponse.json({
        success,
        action: 'clearAll',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required for single deletion' },
        { status: 400 }
      );
    }
    
    const success = await cacheDelete(key);
    
    return NextResponse.json({
      success,
      key,
      action: 'delete',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis cache DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
