import { NextRequest, NextResponse } from 'next/server'
import { updateVendor } from '@/lib/db-menu'
import { pool } from '@/lib/db-menu'

/**
 * PUT /api/menu/vendors/[id]
 * Update a vendor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const vendor = await updateVendor(parseInt(id), data)

    return NextResponse.json({
      success: true,
      data: vendor,
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update vendor',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/menu/vendors/[id]
 * Delete a vendor (soft delete by setting is_active to false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await pool.query(
      'UPDATE siem_app.vendors SET is_active = false WHERE id = $1',
      [parseInt(id)]
    )

    return NextResponse.json({
      success: true,
      message: 'Vendor deactivated successfully',
    })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete vendor',
      },
      { status: 500 }
    )
  }
}
