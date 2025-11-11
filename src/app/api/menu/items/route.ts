import { NextRequest, NextResponse } from 'next/server'
import { getMenuItems, createMenuItem } from '@/lib/db-menu'
import { invalidateAllMenuCache } from '@/lib/redis-cache'

/**
 * GET /api/menu/items
 * Get all menu items with hierarchical structure
 */
export async function GET() {
  try {
    const items = await getMenuItems()

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch menu items',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menu/items
 * Create a new menu item
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.label || !data.href) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, label, href',
        },
        { status: 400 }
      )
    }

    const item = await createMenuItem(data)

    // Invalidate cache after create
    await invalidateAllMenuCache()

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create menu item',
      },
      { status: 500 }
    )
  }
}
