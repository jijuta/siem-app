import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Request password reset
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM siem_app.users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link will be sent'
      })
    }

    const userId = userResult.rows[0].id

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing tokens for this user
    await query(
      'DELETE FROM siem_app.password_reset_tokens WHERE user_id = $1',
      [userId]
    )

    // Store new token
    await query(
      'INSERT INTO siem_app.password_reset_tokens (user_id, token, expires) VALUES ($1, $2, $3)',
      [userId, token, expires]
    )

    // In production, send email with reset link
    // For now, just return success
    // TODO: Implement email sending

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link will be sent',
      // Remove this in production
      token: process.env.NODE_ENV === 'development' ? token : undefined
    })
  } catch (error) {
    console.error('Reset password request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Reset password with token
export async function PUT(request: Request) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Find valid token
    const tokenResult = await query(
      'SELECT user_id FROM siem_app.password_reset_tokens WHERE token = $1 AND expires > NOW()',
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const userId = tokenResult.rows[0].user_id

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10)

    // Update password
    await query(
      'UPDATE siem_app.users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [password_hash, userId]
    )

    // Delete used token
    await query(
      'DELETE FROM siem_app.password_reset_tokens WHERE token = $1',
      [token]
    )

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
