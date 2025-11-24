-- ============================================================
-- Migration: Add Foreign Key Constraints to siem_app.users
-- Date: 2025-11-25
-- Issue: Critical #2 - FK constraints missing
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Verify no orphaned data exists
-- ============================================================

DO $$
DECLARE
  orphan_company_count INTEGER;
  orphan_dept_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_company_count
  FROM siem_app.users
  WHERE company_id IS NOT NULL
    AND company_id NOT IN (SELECT id FROM "Company");

  SELECT COUNT(*) INTO orphan_dept_count
  FROM siem_app.users
  WHERE department_id IS NOT NULL
    AND department_id NOT IN (SELECT id FROM "Department");

  RAISE NOTICE 'Orphaned company_id records: %', orphan_company_count;
  RAISE NOTICE 'Orphaned department_id records: %', orphan_dept_count;

  IF orphan_company_count > 0 OR orphan_dept_count > 0 THEN
    RAISE EXCEPTION 'Orphaned data found! Clean up required.';
  END IF;

  RAISE NOTICE '✓ No orphaned data found. Safe to proceed.';
END $$;

-- ============================================================
-- Step 2: Add Foreign Key Constraints
-- ============================================================

-- Add FK for company_id
ALTER TABLE siem_app.users
ADD CONSTRAINT users_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES "Company"(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add FK for department_id
ALTER TABLE siem_app.users
ADD CONSTRAINT users_department_id_fkey
  FOREIGN KEY (department_id)
  REFERENCES "Department"(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add comments
COMMENT ON CONSTRAINT users_company_id_fkey ON siem_app.users IS
'FK to Company. ON DELETE SET NULL to preserve user records.';

COMMENT ON CONSTRAINT users_department_id_fkey ON siem_app.users IS
'FK to Department. ON DELETE SET NULL to preserve user records.';

-- ============================================================
-- Step 3: Verify constraints
-- ============================================================

DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid = 'siem_app.users'::regclass
    AND conname IN ('users_company_id_fkey', 'users_department_id_fkey');

  IF constraint_count = 2 THEN
    RAISE NOTICE '✓ Verification passed: Both FK constraints exist';
  ELSE
    RAISE EXCEPTION 'Verification failed: Expected 2, found %', constraint_count;
  END IF;
END $$;

COMMIT;

-- Verification query
\echo '=== FK Constraints on siem_app.users ==='
SELECT
  conname as constraint_name,
  contype as type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'siem_app.users'::regclass
ORDER BY contype, conname;
