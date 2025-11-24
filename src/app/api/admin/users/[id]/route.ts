import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

// PUT - Update user (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userResult = await query(
      `SELECT r.code as role
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'admin' && userResult.rows[0]?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { name, role, department, phone, password } = await request.json()
    const userId = parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(name)
    }
    if (role !== undefined) {
      // Convert role code to role_id
      const roleResult = await query(
        'SELECT id FROM siem_app.roles WHERE code = $1',
        [role]
      )
      if (roleResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Invalid role: ${role}` },
          { status: 400 }
        )
      }
      updates.push(`role_id = $${paramIndex++}`)
      values.push(roleResult.rows[0].id)
    }
    if (department !== undefined) {
      updates.push(`department = $${paramIndex++}`)
      values.push(department || null)
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`)
      values.push(phone || null)
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updates.push(`password_hash = $${paramIndex++}`)
      values.push(passwordHash)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const updateQuery = `
      UPDATE siem_app.users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role_id, avatar_url, phone, department, is_active, updated_at
    `

    const result = await query(updateQuery, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Join with roles to get role code
    const userWithRole = await query(
      `SELECT u.*, r.code as role, r.name as role_name
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [result.rows[0].id]
    )

    return NextResponse.json({
      success: true,
      user: userWithRole.rows[0]
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userResult = await query(
      `SELECT r.code as role
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'admin' && userResult.rows[0]?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const userId = parseInt(params.id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Prevent deleting own account
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user
    const result = await query(
      'DELETE FROM siem_app.users WHERE id = $1 RETURNING id',
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
