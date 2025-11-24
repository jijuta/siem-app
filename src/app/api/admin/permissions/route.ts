import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - List all permissions (admin only)
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or super_admin
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const resource = searchParams.get('resource')
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active_only') !== 'false'

    // Build query
    let sqlQuery = `
      SELECT
        id,
        code,
        resource,
        action,
        name,
        description,
        scope,
        category,
        is_system,
        is_active,
        created_at
      FROM siem_app.permissions
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (activeOnly) {
      sqlQuery += ` AND is_active = true`
    }

    if (resource) {
      sqlQuery += ` AND resource = $${paramIndex++}`
      params.push(resource)
    }

    if (category) {
      sqlQuery += ` AND category = $${paramIndex++}`
      params.push(category)
    }

    sqlQuery += ` ORDER BY resource, action`

    const result = await query(sqlQuery, params)

    // Get permission usage stats
    const statsResult = await query(`
      SELECT
        p.id,
        COUNT(DISTINCT rp.role_id) as role_count,
        COUNT(DISTINCT up.user_id) as user_override_count
      FROM siem_app.permissions p
      LEFT JOIN siem_app.role_permissions rp ON p.id = rp.permission_id AND rp.is_granted = true
      LEFT JOIN siem_app.user_permissions up ON p.id = up.permission_id AND up.is_granted = true
      GROUP BY p.id
    `)

    // Merge stats into permissions
    const statsMap = new Map(statsResult.rows.map((row: any) => [row.id, row]))
    const permissionsWithStats = result.rows.map((perm: any) => {
      const stats = statsMap.get(perm.id) || { role_count: 0, user_override_count: 0 }
      return {
        ...perm,
        role_count: parseInt(stats.role_count),
        user_override_count: parseInt(stats.user_override_count)
      }
    })

    return NextResponse.json({
      success: true,
      permissions: permissionsWithStats,
      total: result.rows.length
    })
  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new permission (super_admin only)
export async function POST(request: Request) {
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

    const {
      code,
      resource,
      action,
      name,
      description,
      scope,
      category,
      is_active
    } = await request.json()

    // Validate required fields
    if (!code || !resource || !action || !name) {
      return NextResponse.json(
        { error: 'code, resource, action, and name are required' },
        { status: 400 }
      )
    }

    // Validate name has all required languages
    if (!name.ko || !name.en || !name.ja || !name.zh) {
      return NextResponse.json(
        { error: 'name must include all languages (ko, en, ja, zh)' },
        { status: 400 }
      )
    }

    // Check if permission code already exists
    const existingPerm = await query(
      'SELECT id FROM siem_app.permissions WHERE code = $1',
      [code]
    )

    if (existingPerm.rows.length > 0) {
      return NextResponse.json(
        { error: 'Permission code already exists' },
        { status: 400 }
      )
    }

    // Create permission
    const result = await query(
      `INSERT INTO siem_app.permissions
       (code, resource, action, name, description, scope, category, is_system, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)
       RETURNING id, code, resource, action, name, description, scope, category, is_system, is_active, created_at`,
      [
        code,
        resource,
        action,
        JSON.stringify(name),
        description ? JSON.stringify(description) : null,
        scope || 'COMPANY',
        category || null,
        is_active !== undefined ? is_active : true
      ]
    )

    // Audit log
    await query(
      `INSERT INTO siem_app.permission_audit
       (entity_type, entity_id, action, permission_id, changed_by, new_value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'permission',
        result.rows[0].id,
        'created',
        result.rows[0].id,
        session.user.id,
        JSON.stringify(result.rows[0]),
        'Created via API'
      ]
    )

    return NextResponse.json({
      success: true,
      permission: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Create permission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
