import { NextRequest, NextResponse } from 'next/server'
import { updateMenuItem, deleteMenuItem } from '@/lib/db-menu'
import { invalidateAllMenuCache } from '@/lib/redis-cache'

/**
 * PUT /api/menu/items/[id]
 * Update a menu item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const item = await updateMenuItem(parseInt(id), data)

    // Invalidate cache after update
    await invalidateAllMenuCache()

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update menu item',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/menu/items/[id]
 * Delete a menu item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteMenuItem(parseInt(id))

    // Invalidate cache after delete
    await invalidateAllMenuCache()

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete menu item',
      },
      { status: 500 }
    )
  }
}
