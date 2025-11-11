import { NextRequest, NextResponse } from 'next/server'
import { getVendorsWithPages, createVendor } from '@/lib/db-menu'

/**
 * GET /api/menu/vendors
 * Get all vendors with their pages
 */
export async function GET() {
  try {
    const vendors = await getVendorsWithPages()

    return NextResponse.json({
      success: true,
      data: vendors,
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vendors',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/menu/vendors
 * Create a new vendor
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.vendor_id || !data.name || !data.label) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: vendor_id, name, label',
        },
        { status: 400 }
      )
    }

    const vendor = await createVendor(data)

    return NextResponse.json({
      success: true,
      data: vendor,
    })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create vendor',
      },
      { status: 500 }
    )
  }
}
