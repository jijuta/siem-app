import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Get single company (admin only)
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

    const result = await query(
      `SELECT id, code, name, description, address, phone, email, website,
              logo_url, is_active, created_at, updated_at
       FROM "Company"
       WHERE id = $1`,
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company: result.rows[0]
    })
  } catch (error) {
    console.error('Get company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update company (admin only)
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

    const { code, name, description, address, phone, email, website, logo_url, is_active } = await request.json()

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
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

    // Check if code already exists (excluding current company)
    const existingCompany = await query(
      'SELECT id FROM "Company" WHERE code = $1 AND id != $2',
      [code, params.id]
    )

    if (existingCompany.rows.length > 0) {
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 400 }
      )
    }

    // Update company
    const result = await query(
      `UPDATE "Company"
       SET code = $1, name = $2, description = $3, address = $4, phone = $5,
           email = $6, website = $7, logo_url = $8, is_active = $9,
           updated_at = CURRENT_TIMESTAMP, updated_by = $10
       WHERE id = $11
       RETURNING id, code, name, description, address, phone, email, website,
                 logo_url, is_active, created_at, updated_at`,
      [
        code,
        JSON.stringify(name),
        description ? JSON.stringify(description) : null,
        address || null,
        phone || null,
        email || null,
        website || null,
        logo_url || null,
        is_active !== undefined ? is_active : true,
        session.user.id,
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      company: result.rows[0]
    })
  } catch (error) {
    console.error('Update company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete company (admin only)
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

    // Delete company
    const result = await query(
      'DELETE FROM "Company" WHERE id = $1 RETURNING id',
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    })
  } catch (error) {
    console.error('Delete company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
