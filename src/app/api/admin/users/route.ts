import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - List all users (admin only)
export async function GET() {
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
      'SELECT role FROM siem_app.users WHERE id = $1',
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get all users with company and department info
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.phone, u.department,
              u.company_id, u.department_id,
              u.is_active, u.email_verified, u.created_at, u.last_login_at,
              c.name as company_name, c.code as company_code,
              d.name as department_name, d.code as department_code
       FROM siem_app.users u
       LEFT JOIN "Company" c ON u.company_id = c.id
       LEFT JOIN "Department" d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    )

    return NextResponse.json({
      success: true,
      users: result.rows
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user (admin only)
export async function POST(request: Request) {
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
      'SELECT role FROM siem_app.users WHERE id = $1',
      [session.user.id]
    )

    if (userResult.rows[0]?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { email, name, password, role, department, phone, company_id, department_id } = await request.json()

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM siem_app.users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await query(
      `INSERT INTO siem_app.users (email, name, password_hash, role, department, phone, company_id, department_id, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
       RETURNING id, email, name, role, avatar_url, phone, department, company_id, department_id, is_active, created_at`,
      [email, name, passwordHash, role || 'viewer', department || null, phone || null, company_id || null, department_id || null]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
