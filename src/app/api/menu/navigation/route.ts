import { NextResponse } from 'next/server'
import { getNavigationStructure } from '@/lib/db-menu'
import { convertNavigationStructure } from '@/lib/menu-adapter'
import {
  getOrSetCache,
  CACHE_KEYS,
  CACHE_TTL,
} from '@/lib/redis-cache'

/**
 * GET /api/menu/navigation
 * Get complete navigation structure (categories, menu items, vendors)
 * With Redis caching for performance
 */
export async function GET(request: Request) {
  try {
    // Get language from query params or use default
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'ko'

    // Create language-specific cache key
    const cacheKey = `${CACHE_KEYS.NAVIGATION}:${lang}`

    // Try to get from cache, fallback to database
    const navigation = await getOrSetCache(
      cacheKey,
      CACHE_TTL.NAVIGATION,
      async () => {
        const rawData = await getNavigationStructure()
        // Convert to categorized structure with specified language
        return convertNavigationStructure(rawData, lang)
      }
    )

    return NextResponse.json({
      success: true,
      data: navigation,
      cached: true, // Indicates caching is enabled
      lang, // Return language used
    })
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch navigation structure',
      },
      { status: 500 }
    )
  }
}
