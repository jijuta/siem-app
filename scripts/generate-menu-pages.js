const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'siem_db',
  user: 'opensearch',
  password: 'opensearch123'
});

const APP_DIR = path.join(__dirname, '../src/app');

// Page template
function generatePageContent(menuName) {
  return `import { MetadataPageWrapper } from '@/components/metadata-page-wrapper'

export default function ${toPascalCase(menuName)}Page() {
  return <MetadataPageWrapper />
}
`;
}

// Convert snake_case to PascalCase
function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

async function main() {
  try {
    // Get all menu items with href
    const result = await pool.query(`
      SELECT id, name, href, label
      FROM siem_app.menu_items
      WHERE href IS NOT NULL AND href <> ''
      ORDER BY id
    `);

    console.log(`Found ${result.rows.length} menu items`);

    let created = 0;
    let skipped = 0;

    for (const row of result.rows) {
      const { name, href } = row;

      // Skip menu_management (already exists with full functionality)
      if (href === '/admin/menu_management') {
        console.log(`⏭️  Skipping ${href} (menu management - keep existing)`);
        skipped++;
        continue;
      }

      // Convert href to file path
      const filePath = path.join(APP_DIR, href, 'page.tsx');
      const dirPath = path.dirname(filePath);

      // Check if already exists
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${href} (file exists)`);
        skipped++;
        continue;
      }

      // Create directory if not exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Generate and write page
      const content = generatePageContent(name);
      fs.writeFileSync(filePath, content);

      console.log(`✅ Created ${href}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${result.rows.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
