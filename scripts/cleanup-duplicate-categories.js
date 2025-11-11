/**
 * Cleanup Duplicate Single-Item Categories
 *
 * This script removes the 5 single-item categories that were accidentally created:
 * Dashboard, Search, Analytics, Alerts, Settings
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

async function cleanupCategories() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('='.repeat(70))
    console.log('Cleanup Duplicate Categories')
    console.log('='.repeat(70))
    console.log('')

    const categoriesToDelete = ['Dashboard', 'Search', 'Analytics', 'Alerts', 'Settings']

    // Step 1: Check what will be deleted
    console.log('Step 1: Checking categories and items to be deleted...')
    for (const categoryName of categoriesToDelete) {
      const result = await client.query(`
        SELECT
          mc.id as category_id,
          mc.name as category_name,
          mc.label->>'ko' as category_label,
          mi.id as item_id,
          mi.name as item_name,
          mi.label->>'ko' as item_label,
          mi.href
        FROM siem_app.menu_categories mc
        LEFT JOIN siem_app.menu_items mi ON mc.id = mi.category_id
        WHERE mc.name = $1
      `, [categoryName])

      if (result.rows.length > 0) {
        const row = result.rows[0]
        console.log(`  [${categoryName}]`)
        console.log(`    Category: ${row.category_label} (ID: ${row.category_id})`)
        if (row.item_id) {
          console.log(`    → Item: ${row.item_label} (${row.href})`)
        }
      }
    }

    console.log('')
    console.log('Step 2: Deleting menu items...')

    // Step 2: Delete menu items first (foreign key constraint)
    let deletedItems = 0
    for (const categoryName of categoriesToDelete) {
      const result = await client.query(`
        DELETE FROM siem_app.menu_items
        WHERE category_id IN (
          SELECT id FROM siem_app.menu_categories WHERE name = $1
        )
        RETURNING id, name, label->>'ko' as label_ko
      `, [categoryName])

      deletedItems += result.rowCount
      result.rows.forEach(row => {
        console.log(`  ✓ Deleted item: ${row.label_ko} (ID: ${row.id})`)
      })
    }

    console.log('')
    console.log('Step 3: Deleting categories...')

    // Step 3: Delete categories
    let deletedCategories = 0
    for (const categoryName of categoriesToDelete) {
      const result = await client.query(`
        DELETE FROM siem_app.menu_categories
        WHERE name = $1
        RETURNING id, name, label->>'ko' as label_ko
      `, [categoryName])

      deletedCategories += result.rowCount
      result.rows.forEach(row => {
        console.log(`  ✓ Deleted category: ${row.label_ko} (ID: ${row.id})`)
      })
    }

    console.log('')
    console.log('Step 4: Verifying remaining categories...')

    const remainingResult = await client.query(`
      SELECT
        mc.name,
        mc.label->>'ko' as label_ko,
        mc.order_index,
        COUNT(mi.id) as item_count
      FROM siem_app.menu_categories mc
      LEFT JOIN siem_app.menu_items mi ON mc.id = mi.category_id
      WHERE mc.is_active = true
      GROUP BY mc.id, mc.name, mc.label, mc.order_index
      ORDER BY mc.order_index
    `)

    console.log('')
    console.log('Remaining categories:')
    remainingResult.rows.forEach(row => {
      console.log(`  • ${row.label_ko} (${row.name}) - ${row.item_count} items`)
    })

    await client.query('COMMIT')

    console.log('')
    console.log('='.repeat(70))
    console.log('Cleanup Summary')
    console.log('='.repeat(70))
    console.log(`✓ Categories deleted:   ${deletedCategories}`)
    console.log(`✓ Menu items deleted:   ${deletedItems}`)
    console.log(`✓ Remaining categories: ${remainingResult.rows.length}`)
    console.log('='.repeat(70))

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error during cleanup:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run cleanup
cleanupCategories()
  .then(() => {
    console.log('\nCleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nCleanup failed:', error)
    process.exit(1)
  })
