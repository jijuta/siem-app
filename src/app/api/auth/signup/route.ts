import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, department } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM siem_app.users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const result = await query(
      `INSERT INTO siem_app.users (email, password_hash, name, phone, department, role)
       VALUES ($1, $2, $3, $4, $5, 'viewer')
       RETURNING id, email, name, role`,
      [email, password_hash, name, phone || null, department || null]
    )

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
