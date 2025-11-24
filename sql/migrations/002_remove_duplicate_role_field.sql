-- ============================================================
-- Migration: Remove Duplicate role Field from siem_app.users
-- Date: 2025-11-25
-- Issue: Critical #3 - Duplicate role field (role_string + role_id)
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Check for inconsistencies
-- ============================================================

DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM siem_app.users
  WHERE role <> (SELECT code FROM siem_app.roles WHERE id = role_id);

  RAISE NOTICE 'Inconsistent role records found: %', inconsistent_count;

  IF inconsistent_count > 0 THEN
    RAISE NOTICE 'Will fix inconsistencies before dropping column';
  END IF;
END $$;

-- ============================================================
-- Step 2: Fix inconsistent data
-- ============================================================

-- Update role field to match role_id before dropping
UPDATE siem_app.users u
SET role = r.code
FROM siem_app.roles r
WHERE u.role_id = r.id
  AND u.role <> r.code;

-- Report fixes
DO $$
DECLARE
  fixed_count INTEGER;
BEGIN
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RAISE NOTICE '✓ Fixed % inconsistent role records', fixed_count;
END $$;

-- ============================================================
-- Step 3: Verify all records are consistent
-- ============================================================

DO $$
DECLARE
  inconsistent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistent_count
  FROM siem_app.users
  WHERE role <> (SELECT code FROM siem_app.roles WHERE id = role_id);

  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'Still have % inconsistent records. Cannot proceed.', inconsistent_count;
  END IF;

  RAISE NOTICE '✓ All role fields are now consistent with role_id';
END $$;

-- ============================================================
-- Step 4: Drop the redundant role column
-- ============================================================

-- Remove the column
ALTER TABLE siem_app.users DROP COLUMN role;

DO $$
BEGIN
  RAISE NOTICE '✓ Dropped redundant role column';
END $$;

-- ============================================================
-- Step 5: Verify column is removed
-- ============================================================

DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'siem_app'
      AND table_name = 'users'
      AND column_name = 'role'
  ) INTO column_exists;

  IF column_exists THEN
    RAISE EXCEPTION 'Column role still exists after DROP';
  END IF;

  RAISE NOTICE '✓ Verification passed: role column removed';
END $$;

COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

\echo '=== siem_app.users columns (role should be gone) ==='
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'siem_app'
  AND table_name = 'users'
  AND column_name IN ('role', 'role_id')
ORDER BY column_name;

\echo '=== Sample users with roles (via JOIN) ==='
SELECT
  u.id,
  u.email,
  u.role_id,
  r.code as role_code,
  r.name->>'ko' as role_name_ko
FROM siem_app.users u
JOIN siem_app.roles r ON u.role_id = r.id
LIMIT 5;
