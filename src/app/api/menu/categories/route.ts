import { NextResponse } from 'next/server'
import { pool } from '@/lib/db-menu'

/**
 * GET /api/menu/categories
 * Get all menu categories
 */
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM siem_app.menu_categories WHERE is_active = true ORDER BY order_index ASC'
    )

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    )
  }
}
