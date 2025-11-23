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

    // Get all users
    const result = await query(
      `SELECT id, email, name, role, avatar_url, phone, department,
              is_active, email_verified, created_at, last_login_at
       FROM siem_app.users
       ORDER BY created_at DESC`
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

    const { email, name, password, role, department, phone } = await request.json()

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
      `INSERT INTO siem_app.users (email, name, password_hash, role, department, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, name, role, avatar_url, phone, department, is_active, created_at`,
      [email, name, passwordHash, role || 'viewer', department || null, phone || null]
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
