import { NextResponse } from 'next/server'
import { getAllRolesWithPermissions, setMenuPermission } from '@/lib/db-menu'

// Get all roles with their menu permissions
export async function GET() {
  try {
    const roles = await getAllRolesWithPermissions()

    return NextResponse.json({
      success: true,
      data: roles
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

// Set menu permission for a role
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { menu_item_id, role, can_view } = body

    if (!menu_item_id || !role || typeof can_view !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    await setMenuPermission(menu_item_id, role, can_view)

    return NextResponse.json({
      success: true,
      message: 'Permission updated successfully'
    })
  } catch (error) {
    console.error('Error setting permission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set permission' },
      { status: 500 }
    )
  }
}
