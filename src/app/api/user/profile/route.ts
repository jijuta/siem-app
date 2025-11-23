import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Get current user profile
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await query(
      `SELECT id, email, name, role, avatar_url, phone, department, created_at, last_login_at
       FROM siem_app.users
       WHERE id = $1`,
      [session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, phone, department, avatar_url, currentPassword, newPassword } = await request.json()

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      const userResult = await query(
        'SELECT password_hash FROM siem_app.users WHERE id = $1',
        [session.user.id]
      )

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userResult.rows[0].password_hash
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      await query(
        'UPDATE siem_app.users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, session.user.id]
      )
    }

    // Update other fields
    await query(
      `UPDATE siem_app.users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [name, phone, department, avatar_url, session.user.id]
    )

    const result = await query(
      `SELECT id, email, name, role, avatar_url, phone, department
       FROM siem_app.users
       WHERE id = $1`,
      [session.user.id]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
