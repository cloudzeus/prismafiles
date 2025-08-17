import Redis from 'ioredis';

// Only create Redis client on server side
let redis: Redis | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  // Connection event handlers
  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('🚀 Redis is ready to accept commands');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  redis.on('close', () => {
    console.log('🔌 Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });
}

// Test connection
export async function testRedisConnection() {
  if (!redis) {
    console.log('❌ Redis client not available (client-side)');
    return false;
  }
  
  try {
    await redis.ping();
    console.log('🏓 Redis ping successful');
    return true;
  } catch (error) {
    console.error('❌ Redis ping failed:', error);
    return false;
  }
}

// Cache functions
export async function cacheSet(key: string, value: any, ttl: number = 3600) {
  if (!redis) {
    console.log('❌ Redis client not available (client-side)');
    return false;
  }
  
  try {
    const serializedValue = JSON.stringify(value);
    await redis.setex(key, ttl, serializedValue);
    console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('❌ Cache set error:', error);
    return false;
  }
}

export async function cacheGet(key: string) {
  if (!redis) {
    console.log('❌ Redis client not available (client-side)');
    return null;
  }
  
  try {
    const value = await redis.get(key);
    if (value) {
      console.log(`📖 Cache hit: ${key}`);
      return JSON.parse(value);
    }
    console.log(`❌ Cache miss: ${key}`);
    return null;
  } catch (error) {
    console.error('❌ Cache get error:', error);
    return null;
  }
}

export async function cacheDelete(key: string) {
  if (!redis) {
    console.log('❌ Redis client not available (client-side)');
    return false;
  }
  
  try {
    await redis.del(key);
    console.log(`🗑️ Cache deleted: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Cache delete error:', error);
    return false;
  }
}

export async function cacheClear() {
  if (!redis) {
    console.log('❌ Redis client not available (client-side)');
    return false;
  }
  
  try {
    await redis.flushdb();
    console.log('🧹 Cache cleared');
    return true;
  } catch (error) {
    console.error('❌ Cache clear error:', error);
    return false;
  }
}

export default redis;
