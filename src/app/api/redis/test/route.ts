import { NextResponse } from 'next/server';
import { testRedisConnection } from '@/lib/redis';

export async function GET() {
  try {
    const isConnected = await testRedisConnection();
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
