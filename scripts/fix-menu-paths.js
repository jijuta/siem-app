/**
 * Fix Menu Paths
 *
 * Update all menu item paths to follow the pattern:
 * /app/[category]/[item]
 */

const { Pool } = require('pg')

// Load dotenv only if available
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not available, use environment variables directly
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace('?schema=public', ''),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

async function fixMenuPaths() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('='.repeat(70))
    console.log('Fix Menu Paths')
    console.log('='.repeat(70))
    console.log('')

    // Get all categories and their menu items
    const categoriesResult = await client.query(`
      SELECT id, name FROM siem_app.menu_categories
      WHERE name NOT IN ('vendor_dashboards')
      ORDER BY order_index
    `)

    let updatedCount = 0

    for (const category of categoriesResult.rows) {
      console.log(`\n[${category.name}]`)

      // Get all top-level menu items (no parent_id) in this category
      const itemsResult = await client.query(`
        SELECT id, name, label->>'ko' as label_ko, href
        FROM siem_app.menu_items
        WHERE category_id = $1 AND parent_id IS NULL
        ORDER BY order_index
      `, [category.id])

      for (const item of itemsResult.rows) {
        // Generate new path: /app/[category]/[item]
        const newHref = `/app/${category.name}/${item.name}`

        if (item.href !== newHref) {
          await client.query(`
            UPDATE siem_app.menu_items
            SET href = $1
            WHERE id = $2
          `, [newHref, item.id])

          console.log(`  ✓ ${item.label_ko}`)
          console.log(`    OLD: ${item.href}`)
          console.log(`    NEW: ${newHref}`)
          updatedCount++
        } else {
          console.log(`  - ${item.label_ko} (already correct)`)
        }
      }
    }

    await client.query('COMMIT')

    console.log('')
    console.log('='.repeat(70))
    console.log(`✓ Updated ${updatedCount} menu paths`)
    console.log('='.repeat(70))

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error fixing paths:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run
fixMenuPaths()
  .then(() => {
    console.log('\nPath fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nPath fix failed:', error)
    process.exit(1)
  })
