import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Get single department
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

    const result = await query(
      `SELECT
        d.*,
        c.name as company_name,
        c.code as company_code,
        parent.name as parent_name,
        (SELECT COUNT(*) FROM siem_app.users WHERE department_id = d.id) as user_count
      FROM "Department" d
      LEFT JOIN "Company" c ON d.company_id = c.id
      LEFT JOIN "Department" parent ON d.parent_id = parent.id
      WHERE d.id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      department: result.rows[0]
    })
  } catch (error) {
    console.error('Get department error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update department
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

    const { company_id, parent_id, code, name, description, manager_id } = await request.json()

    // Validate required fields
    if (!company_id || !code || !name) {
      return NextResponse.json(
        { error: 'Company, code and name are required' },
        { status: 400 }
      )
    }

    // Validate name has all required languages
    if (!name.ko || !name.en || !name.ja || !name.zh) {
      return NextResponse.json(
        { error: 'Name must include all languages (ko, en, ja, zh)' },
        { status: 400 }
      )
    }

    // Check if code already exists (excluding current department)
    const existingDept = await query(
      'SELECT id FROM "Department" WHERE company_id = $1 AND code = $2 AND id != $3',
      [company_id, code, params.id]
    )

    if (existingDept.rows.length > 0) {
      return NextResponse.json(
        { error: 'Department code already exists in this company' },
        { status: 400 }
      )
    }

    // Calculate level and path
    let level = 0
    let path = ''

    if (parent_id) {
      const parent = await query(
        'SELECT level, path FROM "Department" WHERE id = $1',
        [parent_id]
      )

      if (parent.rows.length === 0) {
        return NextResponse.json(
          { error: 'Parent department not found' },
          { status: 404 }
        )
      }

      level = parent.rows[0].level + 1
      path = `${parent.rows[0].path}/${params.id}`
    } else {
      path = `/${params.id}`
    }

    // Update department
    const result = await query(
      `UPDATE "Department"
       SET company_id = $1, parent_id = $2, code = $3, name = $4, description = $5,
           level = $6, path = $7, manager_id = $8, updated_by = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        company_id,
        parent_id || null,
        code,
        JSON.stringify(name),
        description ? JSON.stringify(description) : null,
        level,
        path,
        manager_id || null,
        session.user.id,
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Update paths of all child departments if parent changed
    await query(
      `UPDATE "Department"
       SET path = REPLACE(path, $1, $2),
           level = level + $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE path LIKE $4 AND id != $5`,
      [
        `/${params.id}`,
        path,
        level,
        `%/${params.id}/%`,
        params.id
      ]
    )

    return NextResponse.json({
      success: true,
      department: result.rows[0]
    })
  } catch (error) {
    console.error('Update department error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete department
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

    // Check if department has child departments
    const childCount = await query(
      'SELECT COUNT(*) as count FROM "Department" WHERE parent_id = $1',
      [params.id]
    )

    if (parseInt(childCount.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with child departments' },
        { status: 400 }
      )
    }

    // Check if department has users
    const userCount = await query(
      'SELECT COUNT(*) as count FROM siem_app.users WHERE department_id = $1',
      [params.id]
    )

    if (parseInt(userCount.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with assigned users' },
        { status: 400 }
      )
    }

    // Delete department
    const result = await query(
      'DELETE FROM "Department" WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    })
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
