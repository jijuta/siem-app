import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Get single permission (admin only)
export async function GET(
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

    const permissionId = parseInt(params.id)

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { error: 'Invalid permission ID' },
        { status: 400 }
      )
    }

    // Get permission details
    const result = await query(
      `SELECT
        id, code, resource, action, name, description,
        scope, category, is_system, is_active, created_at
       FROM siem_app.permissions
       WHERE id = $1`,
      [permissionId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    // Get roles that have this permission
    const rolesResult = await query(
      `SELECT r.id, r.code, r.name, rp.is_granted, rp.granted_at
       FROM siem_app.role_permissions rp
       JOIN siem_app.roles r ON rp.role_id = r.id
       WHERE rp.permission_id = $1`,
      [permissionId]
    )

    // Get users with overrides
    const usersResult = await query(
      `SELECT u.id, u.email, u.name, up.is_granted, up.granted_at, up.expires_at, up.reason
       FROM siem_app.user_permissions up
       JOIN siem_app.users u ON up.user_id = u.id
       WHERE up.permission_id = $1`,
      [permissionId]
    )

    return NextResponse.json({
      success: true,
      permission: {
        ...result.rows[0],
        roles: rolesResult.rows,
        user_overrides: usersResult.rows
      }
    })
  } catch (error) {
    console.error('Get permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update permission (super_admin only)
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

    // Check if user is super_admin
    const userResult = await query(
      `SELECT r.code as role
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      )
    }

    const permissionId = parseInt(params.id)

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { error: 'Invalid permission ID' },
        { status: 400 }
      )
    }

    // Check if permission is system permission
    const checkResult = await query(
      'SELECT is_system FROM siem_app.permissions WHERE id = $1',
      [permissionId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system permissions' },
        { status: 403 }
      )
    }

    const {
      name,
      description,
      scope,
      category,
      is_active
    } = await request.json()

    // Build update query
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      if (!name.ko || !name.en || !name.ja || !name.zh) {
        return NextResponse.json(
          { error: 'name must include all languages (ko, en, ja, zh)' },
          { status: 400 }
        )
      }
      updates.push(`name = $${paramIndex++}`)
      values.push(JSON.stringify(name))
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(description ? JSON.stringify(description) : null)
    }

    if (scope !== undefined) {
      updates.push(`scope = $${paramIndex++}`)
      values.push(scope)
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      values.push(category)
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      values.push(is_active)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    values.push(permissionId)

    const updateQuery = `
      UPDATE siem_app.permissions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, code, resource, action, name, description, scope, category, is_system, is_active, created_at
    `

    const result = await query(updateQuery, values)

    // Audit log
    await query(
      `INSERT INTO siem_app.permission_audit
       (entity_type, entity_id, action, permission_id, changed_by, new_value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'permission',
        permissionId,
        'updated',
        permissionId,
        session.user.id,
        JSON.stringify(result.rows[0]),
        'Updated via API'
      ]
    )

    return NextResponse.json({
      success: true,
      permission: result.rows[0]
    })
  } catch (error) {
    console.error('Update permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete permission (super_admin only, non-system only)
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

    // Check if user is super_admin
    const userResult = await query(
      `SELECT r.code as role
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      )
    }

    const permissionId = parseInt(params.id)

    if (isNaN(permissionId)) {
      return NextResponse.json(
        { error: 'Invalid permission ID' },
        { status: 400 }
      )
    }

    // Check if permission is system permission
    const checkResult = await query(
      'SELECT is_system, code FROM siem_app.permissions WHERE id = $1',
      [permissionId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system permissions' },
        { status: 403 }
      )
    }

    // Audit log before deletion
    await query(
      `INSERT INTO siem_app.permission_audit
       (entity_type, entity_id, action, permission_id, changed_by, old_value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'permission',
        permissionId,
        'deleted',
        permissionId,
        session.user.id,
        JSON.stringify(checkResult.rows[0]),
        'Deleted via API'
      ]
    )

    // Delete permission (CASCADE will remove role_permissions and user_permissions)
    await query(
      'DELETE FROM siem_app.permissions WHERE id = $1',
      [permissionId]
    )

    return NextResponse.json({
      success: true,
      message: 'Permission deleted successfully'
    })
  } catch (error) {
    console.error('Delete permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
