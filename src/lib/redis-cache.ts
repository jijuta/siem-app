/**
 * Redis Cache Layer for Menu System
 * Provides caching for navigation structure to improve performance
 */

import Redis from 'ioredis'

// Redis client singleton
let redisClient: Redis | null = null

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis | null {
  // Skip Redis if not configured
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.warn('Redis not configured, caching disabled')
    return null
  }

  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = new Redis(
      process.env.REDIS_URL || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3,
      }
    )

    redisClient.on('error', (err) => {
      console.error('Redis error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis connected successfully')
    })

    return redisClient
  } catch (error) {
    console.error('Failed to create Redis client:', error)
    return null
  }
}

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  NAVIGATION: 'menu:navigation',
  MENU_ITEMS: 'menu:items',
  VENDORS: 'menu:vendors',
  VENDOR_PAGES: (vendorId: number) => `menu:vendor:${vendorId}:pages`,
}

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  NAVIGATION: 300, // 5 minutes
  MENU_ITEMS: 300,
  VENDORS: 600, // 10 minutes
  VENDOR_PAGES: 600,
}

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const data = await redis.get(key)
    if (!data) return null

    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

/**
 * Set cached data
 */
export async function setCached(
  key: string,
  data: any,
  ttl: number = CACHE_TTL.NAVIGATION
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(keyOrPattern: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    // If pattern contains wildcard, scan and delete
    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } else {
      await redis.del(keyOrPattern)
    }
  } catch (error) {
    console.error(`Cache invalidation error for ${keyOrPattern}:`, error)
  }
}

/**
 * Invalidate all menu-related cache
 */
export async function invalidateAllMenuCache(): Promise<void> {
  await invalidateCache('menu:*')
}

/**
 * Get or set cache with callback
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  callback: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, execute callback
  const data = await callback()

  // Store in cache
  await setCached(key, data, ttl)

  return data
}

/**
 * Health check for Redis
 */
export async function checkRedisHealth(): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}
