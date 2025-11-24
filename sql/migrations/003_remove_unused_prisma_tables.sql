-- ============================================================
-- Migration: Remove Unused Prisma Tables from public schema
-- Date: 2025-11-25
-- Issue: Critical #1 - Dual user table problem (public.User vs siem_app.users)
-- ============================================================
--
-- Analysis:
-- - public.User: 0 users (UNUSED)
-- - siem_app.users: 126 users (ACTIVE, used by all APIs)
-- - All dependent tables (Account, Session, Dashboard, SavedQuery, AlertConfig): 0 rows
-- - Application exclusively uses siem_app schema for user management
--
-- Action: Drop unused public schema tables (Prisma-generated but not used)
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Verify no data exists in public schema tables
-- ============================================================

DO $$
DECLARE
  user_count INTEGER;
  account_count INTEGER;
  session_count INTEGER;
  dashboard_count INTEGER;
  query_count INTEGER;
  alert_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM "User";
  SELECT COUNT(*) INTO account_count FROM "Account";
  SELECT COUNT(*) INTO session_count FROM "Session";
  SELECT COUNT(*) INTO dashboard_count FROM "Dashboard";
  SELECT COUNT(*) INTO query_count FROM "SavedQuery";
  SELECT COUNT(*) INTO alert_count FROM "AlertConfig";

  RAISE NOTICE 'Data counts:';
  RAISE NOTICE '  - User: %', user_count;
  RAISE NOTICE '  - Account: %', account_count;
  RAISE NOTICE '  - Session: %', session_count;
  RAISE NOTICE '  - Dashboard: %', dashboard_count;
  RAISE NOTICE '  - SavedQuery: %', query_count;
  RAISE NOTICE '  - AlertConfig: %', alert_count;

  IF user_count > 0 OR account_count > 0 OR session_count > 0 OR
     dashboard_count > 0 OR query_count > 0 OR alert_count > 0 THEN
    RAISE EXCEPTION 'Tables contain data! Cannot proceed with deletion. Please migrate data first.';
  END IF;

  RAISE NOTICE '✓ All tables are empty. Safe to proceed.';
END $$;

-- ============================================================
-- Step 2: Drop dependent tables (with CASCADE for safety)
-- ============================================================

-- Drop tables that reference User
DROP TABLE IF EXISTS "AlertConfig" CASCADE;
DROP TABLE IF EXISTS "SavedQuery" CASCADE;
DROP TABLE IF EXISTS "Dashboard" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Dropped dependent tables: AlertConfig, SavedQuery, Dashboard, Session, Account';
END $$;

-- ============================================================
-- Step 3: Drop User table and related objects
-- ============================================================

-- Drop the User table
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop the Role enum if it exists and is only used by User table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    DROP TYPE "Role" CASCADE;
    RAISE NOTICE '✓ Dropped Role enum type';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✓ Dropped User table';
END $$;

-- ============================================================
-- Step 4: Drop VerificationToken table (if exists and unused)
-- ============================================================

DROP TABLE IF EXISTS "VerificationToken" CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Dropped VerificationToken table (if existed)';
END $$;

-- ============================================================
-- Step 5: Verify cleanup
-- ============================================================

DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('User', 'Account', 'Session', 'Dashboard', 'SavedQuery', 'AlertConfig', 'VerificationToken');

  IF remaining_count > 0 THEN
    RAISE EXCEPTION 'Some tables still exist after DROP. Count: %', remaining_count;
  END IF;

  RAISE NOTICE '✓ Verification passed: All target tables removed';
END $$;

-- ============================================================
-- Step 6: Document active user management tables
-- ============================================================

DO $$
DECLARE
  active_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_user_count FROM siem_app.users;

  RAISE NOTICE '';
  RAISE NOTICE '=== Active User Management System ===';
  RAISE NOTICE 'Schema: siem_app';
  RAISE NOTICE 'Main table: siem_app.users (%  users)', active_user_count;
  RAISE NOTICE 'Related tables:';
  RAISE NOTICE '  - siem_app.roles';
  RAISE NOTICE '  - siem_app.sessions';
  RAISE NOTICE '  - siem_app.audit_logs';
  RAISE NOTICE '  - siem_app.password_reset_tokens';
  RAISE NOTICE '';
END $$;

COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

\echo '=== Remaining public schema tables (should not include User-related) ==='
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '=== Active siem_app.users summary ==='
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_users,
  COUNT(DISTINCT company_id) as companies,
  COUNT(DISTINCT role_id) as roles
FROM siem_app.users;
