import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - List all companies (admin only)
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

    // Get all companies
    const result = await query(
      `SELECT id, code, name, description, address, phone, email, website,
              logo_url, is_active, created_at, updated_at
       FROM "Company"
       ORDER BY created_at DESC`
    )

    return NextResponse.json({
      success: true,
      companies: result.rows
    })
  } catch (error) {
    console.error('Get companies error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new company (admin only)
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

    const { code, name, description, address, phone, email, website, logo_url } = await request.json()

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

    // Check if code already exists
    const existingCompany = await query(
      'SELECT id FROM "Company" WHERE code = $1',
      [code]
    )

    if (existingCompany.rows.length > 0) {
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 400 }
      )
    }

    // Create company
    const result = await query(
      `INSERT INTO "Company" (code, name, description, address, phone, email, website, logo_url, is_active, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $9)
       RETURNING id, code, name, description, address, phone, email, website, logo_url, is_active, created_at, updated_at`,
      [
        code,
        JSON.stringify(name),
        description ? JSON.stringify(description) : null,
        address || null,
        phone || null,
        email || null,
        website || null,
        logo_url || null,
        session.user.id
      ]
    )

    return NextResponse.json({
      success: true,
      company: result.rows[0]
    })
  } catch (error) {
    console.error('Create company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
