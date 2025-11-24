import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Get permissions for a specific role
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

    const roleId = parseInt(params.id)

    if (isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    // Get role details
    const roleResult = await query(
      'SELECT id, code, name, description, level FROM siem_app.roles WHERE id = $1',
      [roleId]
    )

    if (roleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    // Get permissions assigned to this role
    const result = await query(
      `SELECT
        p.id,
        p.code,
        p.resource,
        p.action,
        p.name,
        p.description,
        p.scope,
        p.category,
        rp.is_granted,
        rp.granted_at,
        u.name as granted_by_name
       FROM siem_app.role_permissions rp
       JOIN siem_app.permissions p ON rp.permission_id = p.id
       LEFT JOIN siem_app.users u ON rp.granted_by = u.id
       WHERE rp.role_id = $1 AND p.is_active = true
       ORDER BY p.resource, p.action`,
      [roleId]
    )

    return NextResponse.json({
      success: true,
      role: roleResult.rows[0],
      permissions: result.rows,
      total: result.rows.length
    })
  } catch (error) {
    console.error('Get role permissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Assign permission to role
export async function POST(
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

    // Check if user is super_admin (only super_admin can assign permissions)
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

    const roleId = parseInt(params.id)

    if (isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    const { permission_ids, is_granted, reason } = await request.json()

    if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
      return NextResponse.json(
        { error: 'permission_ids array is required' },
        { status: 400 }
      )
    }

    // Verify role exists
    const roleCheck = await query(
      'SELECT id FROM siem_app.roles WHERE id = $1',
      [roleId]
    )

    if (roleCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    // Verify all permissions exist
    const permCheck = await query(
      `SELECT id FROM siem_app.permissions WHERE id = ANY($1) AND is_active = true`,
      [permission_ids]
    )

    if (permCheck.rows.length !== permission_ids.length) {
      return NextResponse.json(
        { error: 'One or more permissions not found or inactive' },
        { status: 400 }
      )
    }

    const granted = is_granted !== undefined ? is_granted : true

    // Insert or update role_permissions
    const insertedPermissions = []
    for (const permId of permission_ids) {
      const result = await query(
        `INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_by, granted_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (role_id, permission_id)
         DO UPDATE SET is_granted = $3, granted_by = $4, granted_at = CURRENT_TIMESTAMP
         RETURNING id, role_id, permission_id, is_granted, granted_at`,
        [roleId, permId, granted, session.user.id]
      )

      insertedPermissions.push(result.rows[0])

      // Audit log
      await query(
        `INSERT INTO siem_app.permission_audit
         (entity_type, entity_id, action, permission_id, role_id, changed_by, new_value, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'role_permission',
          result.rows[0].id,
          granted ? 'granted' : 'revoked',
          permId,
          roleId,
          session.user.id,
          JSON.stringify(result.rows[0]),
          reason || (granted ? 'Permission granted via API' : 'Permission revoked via API')
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: `${insertedPermissions.length} permission(s) ${granted ? 'granted' : 'revoked'}`,
      role_permissions: insertedPermissions
    }, { status: 201 })
  } catch (error) {
    console.error('Assign role permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove permission from role
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

    const roleId = parseInt(params.id)

    if (isNaN(roleId)) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      )
    }

    const { permission_ids } = await request.json()

    if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
      return NextResponse.json(
        { error: 'permission_ids array is required' },
        { status: 400 }
      )
    }

    // Audit log before deletion
    const toDelete = await query(
      `SELECT id, role_id, permission_id FROM siem_app.role_permissions
       WHERE role_id = $1 AND permission_id = ANY($2)`,
      [roleId, permission_ids]
    )

    for (const row of toDelete.rows) {
      await query(
        `INSERT INTO siem_app.permission_audit
         (entity_type, entity_id, action, permission_id, role_id, changed_by, old_value, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'role_permission',
          row.id,
          'removed',
          row.permission_id,
          row.role_id,
          session.user.id,
          JSON.stringify(row),
          'Permission removed via API'
        ]
      )
    }

    // Delete role_permissions
    const result = await query(
      `DELETE FROM siem_app.role_permissions
       WHERE role_id = $1 AND permission_id = ANY($2)
       RETURNING id`,
      [roleId, permission_ids]
    )

    return NextResponse.json({
      success: true,
      message: `${result.rows.length} permission(s) removed from role`
    })
  } catch (error) {
    console.error('Remove role permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
