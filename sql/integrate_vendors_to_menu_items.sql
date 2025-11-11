-- ============================================================================
-- Integrate Vendors into Menu Items System
-- ============================================================================
-- Purpose: Migrate vendors and vendor_pages into menu_items structure
-- while keeping the original tables as reference
--
-- Strategy:
-- 1. Create "vendor_dashboards" category (order_index: 100)
-- 2. Migrate each vendor as a top-level menu item in this category
-- 3. Migrate vendor_pages as children of their respective vendor menu items
-- 4. Keep original vendors and vendor_pages tables intact for reference
-- ============================================================================

BEGIN;

-- Step 1: Create "Vendor Dashboards" category
-- ============================================================================
INSERT INTO siem_app.menu_categories (
  name,
  label,
  icon,
  color,
  order_index,
  is_active
) VALUES (
  'vendor_dashboards',
  '{"ko": "벤더 대시보드", "en": "Vendor Dashboards", "ja": "ベンダーダッシュボード", "zh": "供应商仪表板"}'::jsonb,
  'Building2',
  'blue',
  100,  -- Place at the end
  true
) ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

-- Get the category_id for vendor_dashboards
DO $$
DECLARE
  vendor_category_id INTEGER;
  vendor_record RECORD;
  vendor_page_record RECORD;
  parent_menu_id INTEGER;
BEGIN
  -- Get category ID
  SELECT id INTO vendor_category_id
  FROM siem_app.menu_categories
  WHERE name = 'vendor_dashboards';

  -- Step 2: Migrate vendors to menu_items
  -- ============================================================================
  FOR vendor_record IN
    SELECT * FROM siem_app.vendors ORDER BY order_index
  LOOP
    -- Check if vendor already exists in menu_items
    SELECT id INTO parent_menu_id
    FROM siem_app.menu_items
    WHERE name = 'vendor_' || vendor_record.vendor_id;

    IF parent_menu_id IS NULL THEN
      -- Insert vendor as menu item
      INSERT INTO siem_app.menu_items (
        category_id,
        parent_id,
        name,
        label,
        href,
        icon,
        description,
        order_index,
        is_active,
        badge
      ) VALUES (
        vendor_category_id,
        NULL,  -- Top-level item
        'vendor_' || vendor_record.vendor_id,  -- Prefix with 'vendor_'
        vendor_record.label,
        '/' || vendor_record.vendor_id,
        vendor_record.icon,
        vendor_record.description,
        vendor_record.order_index,
        vendor_record.is_active,
        NULL
      ) RETURNING id INTO parent_menu_id;

      RAISE NOTICE 'Migrated vendor: % (ID: %)', vendor_record.name, parent_menu_id;
    ELSE
      RAISE NOTICE 'Vendor already exists: % (ID: %)', vendor_record.name, parent_menu_id;
    END IF;

    -- Step 3: Migrate vendor_pages as children
    -- ============================================================================
    FOR vendor_page_record IN
      SELECT * FROM siem_app.vendor_pages
      WHERE vendor_id = vendor_record.id
      ORDER BY order_index
    LOOP
      -- Check if page already exists
      IF NOT EXISTS (
        SELECT 1 FROM siem_app.menu_items
        WHERE parent_id = parent_menu_id
        AND name = 'vendor_page_' || vendor_page_record.id
      ) THEN
        -- Insert vendor page as child menu item
        INSERT INTO siem_app.menu_items (
          category_id,
          parent_id,  -- Set parent to the vendor menu item
          name,
          label,
          href,
          icon,
          description,
          order_index,
          is_active,
          badge
        ) VALUES (
          vendor_category_id,
          parent_menu_id,
          'vendor_page_' || vendor_page_record.id,
          vendor_page_record.label,
          vendor_page_record.href,
          NULL,  -- Vendor pages typically don't have icons
          NULL,
          vendor_page_record.order_index,
          vendor_page_record.is_active,
          NULL
        );

        RAISE NOTICE '  ↳ Migrated page: % under vendor ID %', vendor_page_record.name, parent_menu_id;
      ELSE
        RAISE NOTICE '  ↳ Page already exists: %', vendor_page_record.name;
      END IF;
    END LOOP;

  END LOOP;

END $$;

-- Step 4: Verify migration
-- ============================================================================
DO $$
DECLARE
  vendor_count INTEGER;
  vendor_page_count INTEGER;
  migrated_vendor_count INTEGER;
  migrated_page_count INTEGER;
BEGIN
  -- Count original data
  SELECT COUNT(*) INTO vendor_count FROM siem_app.vendors WHERE is_active = true;
  SELECT COUNT(*) INTO vendor_page_count FROM siem_app.vendor_pages WHERE is_active = true;

  -- Count migrated data
  SELECT COUNT(*) INTO migrated_vendor_count
  FROM siem_app.menu_items mi
  JOIN siem_app.menu_categories mc ON mi.category_id = mc.id
  WHERE mc.name = 'vendor_dashboards' AND mi.parent_id IS NULL;

  SELECT COUNT(*) INTO migrated_page_count
  FROM siem_app.menu_items mi
  JOIN siem_app.menu_categories mc ON mi.category_id = mc.id
  WHERE mc.name = 'vendor_dashboards' AND mi.parent_id IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Active Vendors:        % → % menu items', vendor_count, migrated_vendor_count;
  RAISE NOTICE 'Active Vendor Pages:   % → % menu items', vendor_page_count, migrated_page_count;
  RAISE NOTICE '';

  IF vendor_count = migrated_vendor_count THEN
    RAISE NOTICE '✓ Vendor migration successful!';
  ELSE
    RAISE WARNING '✗ Vendor count mismatch!';
  END IF;

  IF vendor_page_count = migrated_page_count THEN
    RAISE NOTICE '✓ Vendor pages migration successful!';
  ELSE
    RAISE WARNING '✗ Vendor pages count mismatch!';
  END IF;

  RAISE NOTICE '=================================================================';
END $$;

-- Step 5: Display migrated structure
-- ============================================================================
SELECT
  mc.name AS category,
  CASE
    WHEN mi.parent_id IS NULL THEN mi.label->>'ko'
    ELSE '  ↳ ' || mi.label->>'ko'
  END AS menu_item,
  mi.href,
  mi.order_index,
  mi.is_active
FROM siem_app.menu_items mi
JOIN siem_app.menu_categories mc ON mi.category_id = mc.id
WHERE mc.name = 'vendor_dashboards'
ORDER BY mi.parent_id NULLS FIRST, mi.order_index;

COMMIT;

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. Original vendors and vendor_pages tables are kept intact
-- 2. The admin UI "Vendors" tab will still work with the original tables
-- 3. The sidebar will now render vendors from menu_items
-- 4. Vendor menu items are prefixed with 'vendor_' to avoid name conflicts
-- 5. Vendor pages are prefixed with 'vendor_page_' + original page ID
-- ============================================================================
