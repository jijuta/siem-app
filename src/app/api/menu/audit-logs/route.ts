import { NextResponse } from 'next/server'
import { pool } from '@/lib/db-menu'

/**
 * GET /api/menu/audit-logs
 * Get recent audit logs
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        table_name,
        record_id,
        action,
        changed_by,
        changed_at,
        ip_address,
        CASE
          WHEN action = 'INSERT' THEN new_data->>'name'
          WHEN action = 'UPDATE' THEN new_data->>'name'
          WHEN action = 'DELETE' THEN old_data->>'name'
        END as item_name
      FROM siem_app.menu_audit_log
      ORDER BY changed_at DESC
      LIMIT 100
    `)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
      },
      { status: 500 }
    )
  }
}
