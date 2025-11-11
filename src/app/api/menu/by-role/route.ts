import { NextResponse } from 'next/server'
import { getNavigationStructureByRole } from '@/lib/db-menu'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    const navigation = await getNavigationStructureByRole(role)

    return NextResponse.json({
      success: true,
      data: navigation
    })
  } catch (error) {
    console.error('Error fetching navigation by role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation by role' },
      { status: 500 }
    )
  }
}
