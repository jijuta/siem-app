/**
 * Migrate Vendors to Menu Items
 *
 * This script integrates vendors and vendor_pages into the menu_items structure
 * while keeping the original tables as reference for the admin UI.
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

async function migrateVendors() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('='.repeat(70))
    console.log('Vendor to Menu Items Migration')
    console.log('='.repeat(70))
    console.log('')

    // Step 1: Create vendor_dashboards category
    console.log('Step 1: Creating "vendor_dashboards" category...')
    const categoryResult = await client.query(`
      INSERT INTO siem_app.menu_categories (
        name, label, icon, color, order_index, is_active
      ) VALUES (
        'vendor_dashboards',
        '{"ko": "벤더 대시보드", "en": "Vendor Dashboards", "ja": "ベンダーダッシュボード", "zh": "供应商仪表板"}'::jsonb,
        'Building2',
        'blue',
        100,
        true
      )
      RETURNING id, name
    `)

    const categoryId = categoryResult.rows[0].id
    console.log(`✓ Category created with ID: ${categoryId}`)
    console.log('')

    // Step 2: Get all active vendors
    console.log('Step 2: Fetching vendors...')
    const vendorsResult = await client.query(`
      SELECT * FROM siem_app.vendors ORDER BY order_index
    `)

    const vendors = vendorsResult.rows
    console.log(`Found ${vendors.length} vendors`)
    console.log('')

    let migratedVendors = 0
    let migratedPages = 0

    // Step 3: Migrate each vendor and its pages
    console.log('Step 3: Migrating vendors and pages...')
    console.log('')

    for (const vendor of vendors) {
      // Check if vendor already exists
      const existingVendor = await client.query(`
        SELECT id FROM siem_app.menu_items
        WHERE name = $1
      `, [`vendor_${vendor.vendor_id}`])

      let vendorMenuId

      if (existingVendor.rows.length === 0) {
        // Insert vendor as menu item
        const vendorInsert = await client.query(`
          INSERT INTO siem_app.menu_items (
            category_id, parent_id, name, label, href, icon,
            description, order_index, is_active, badge
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `, [
          categoryId,
          null,
          `vendor_${vendor.vendor_id}`,
          vendor.label,
          `/${vendor.vendor_id}`,
          vendor.icon,
          vendor.description,
          vendor.order_index,
          vendor.is_active,
          null
        ])

        vendorMenuId = vendorInsert.rows[0].id
        migratedVendors++
        console.log(`✓ Migrated vendor: ${vendor.name} (${vendor.vendor_id}) - Menu ID: ${vendorMenuId}`)
      } else {
        vendorMenuId = existingVendor.rows[0].id
        console.log(`  Vendor already exists: ${vendor.name} - Menu ID: ${vendorMenuId}`)
      }

      // Migrate vendor pages as children
      const pagesResult = await client.query(`
        SELECT * FROM siem_app.vendor_pages
        WHERE vendor_id = $1
        ORDER BY order_index
      `, [vendor.id])

      for (const page of pagesResult.rows) {
        const existingPage = await client.query(`
          SELECT id FROM siem_app.menu_items
          WHERE parent_id = $1 AND name = $2
        `, [vendorMenuId, `vendor_page_${page.id}`])

        if (existingPage.rows.length === 0) {
          await client.query(`
            INSERT INTO siem_app.menu_items (
              category_id, parent_id, name, label, href, icon,
              description, order_index, is_active, badge
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            categoryId,
            vendorMenuId,
            `vendor_page_${page.id}`,
            page.label,
            page.href,
            null,
            null,
            page.order_index,
            page.is_active,
            null
          ])

          migratedPages++
          console.log(`  ↳ Migrated page: ${page.name} (${page.href})`)
        } else {
          console.log(`  ↳ Page already exists: ${page.name}`)
        }
      }

      console.log('')
    }

    await client.query('COMMIT')

    // Summary
    console.log('='.repeat(70))
    console.log('Migration Summary')
    console.log('='.repeat(70))
    console.log(`✓ Vendors migrated:       ${migratedVendors}`)
    console.log(`✓ Vendor pages migrated:  ${migratedPages}`)
    console.log(`✓ Total menu items added: ${migratedVendors + migratedPages}`)
    console.log('')
    console.log('Note: Original vendors and vendor_pages tables remain intact.')
    console.log('='.repeat(70))

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error during migration:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run migration
migrateVendors()
  .then(() => {
    console.log('\nMigration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })
