-- ============================================================
-- Migration: Enhance Existing RBAC System
-- Date: 2025-11-25
-- Purpose: Add missing columns and tables to complete RBAC
-- ============================================================
--
-- Status Check:
-- ✓ siem_app.permissions exists (19 rows)
-- ✓ siem_app.role_permissions exists
-- ✗ Missing: user_permissions, permission_audit tables
-- ✗ Missing: scope, category, is_system columns in permissions
-- ✗ Missing: helper functions
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Enhance permissions table with missing columns
-- ============================================================

-- Add scope column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'permissions' AND column_name = 'scope'
  ) THEN
    ALTER TABLE siem_app.permissions
      ADD COLUMN scope VARCHAR(50) DEFAULT 'COMPANY';
    RAISE NOTICE '✓ Added scope column to permissions';
  ELSE
    RAISE NOTICE '- scope column already exists';
  END IF;
END $$;

-- Add category column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'permissions' AND column_name = 'category'
  ) THEN
    ALTER TABLE siem_app.permissions
      ADD COLUMN category VARCHAR(50);
    RAISE NOTICE '✓ Added category column to permissions';
  ELSE
    RAISE NOTICE '- category column already exists';
  END IF;
END $$;

-- Add is_system column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'permissions' AND column_name = 'is_system'
  ) THEN
    ALTER TABLE siem_app.permissions
      ADD COLUMN is_system BOOLEAN DEFAULT false;

    -- Mark existing permissions as system permissions
    UPDATE siem_app.permissions SET is_system = true;

    RAISE NOTICE '✓ Added is_system column and marked existing permissions';
  ELSE
    RAISE NOTICE '- is_system column already exists';
  END IF;
END $$;

-- Add indexes if not exists
CREATE INDEX IF NOT EXISTS idx_permissions_category ON siem_app.permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_scope ON siem_app.permissions(scope);
CREATE INDEX IF NOT EXISTS idx_permissions_is_system ON siem_app.permissions(is_system);

-- Add comments
COMMENT ON COLUMN siem_app.permissions.scope IS 'Data access scope: ALL (system-wide), COMPANY, DEPARTMENT, OWN (user''s own data)';
COMMENT ON COLUMN siem_app.permissions.category IS 'Permission category: system_admin, security, analysis, reports, etc.';
COMMENT ON COLUMN siem_app.permissions.is_system IS 'System permissions cannot be deleted';

-- ============================================================
-- Step 2: Enhance role_permissions table
-- ============================================================

-- Rename 'granted' to 'is_granted' for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'role_permissions' AND column_name = 'granted'
  ) THEN
    ALTER TABLE siem_app.role_permissions RENAME COLUMN granted TO is_granted;
    RAISE NOTICE '✓ Renamed granted to is_granted';
  ELSE
    RAISE NOTICE '- Column already named is_granted or does not exist';
  END IF;
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '- is_granted column already exists';
END $$;

-- Add granted_by column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'role_permissions' AND column_name = 'granted_by'
  ) THEN
    ALTER TABLE siem_app.role_permissions
      ADD COLUMN granted_by INTEGER REFERENCES siem_app.users(id) ON DELETE SET NULL,
      ADD COLUMN granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE '✓ Added granted_by and granted_at columns';
  ELSE
    RAISE NOTICE '- granted_by column already exists';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_role_permissions_granted ON siem_app.role_permissions(is_granted);

-- ============================================================
-- Step 3: Create user_permissions table (individual overrides)
-- ============================================================

CREATE TABLE IF NOT EXISTS siem_app.user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES siem_app.users(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES siem_app.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true, -- true = grant, false = deny (override role)
  granted_by INTEGER REFERENCES siem_app.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Optional expiration for temporary permissions
  reason TEXT, -- Reason for exception
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_permission UNIQUE (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON siem_app.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON siem_app.user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted ON siem_app.user_permissions(is_granted);
CREATE INDEX IF NOT EXISTS idx_user_permissions_expires ON siem_app.user_permissions(expires_at);

COMMENT ON TABLE siem_app.user_permissions IS 'User-specific permission overrides (exceptions to role permissions)';
COMMENT ON COLUMN siem_app.user_permissions.is_granted IS 'true = grant permission, false = deny permission (override role)';
COMMENT ON COLUMN siem_app.user_permissions.expires_at IS 'Optional expiration for temporary permissions';

DO $$
BEGIN
  RAISE NOTICE '✓ Created user_permissions table';
END $$;

-- ============================================================
-- Step 4: Create permission_audit table
-- ============================================================

CREATE TABLE IF NOT EXISTS siem_app.permission_audit (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'role_permission', 'user_permission', 'permission'
  entity_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'granted', 'revoked', 'created', 'updated', 'deleted'
  permission_id INTEGER,
  role_id INTEGER,
  user_id INTEGER,
  changed_by INTEGER REFERENCES siem_app.users(id) ON DELETE SET NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_entity ON siem_app.permission_audit(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_permission ON siem_app.permission_audit(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_role ON siem_app.permission_audit(role_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_user ON siem_app.permission_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_changed_by ON siem_app.permission_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_permission_audit_created ON siem_app.permission_audit(created_at);

COMMENT ON TABLE siem_app.permission_audit IS 'Audit log for all permission-related changes';
COMMENT ON COLUMN siem_app.permission_audit.entity_type IS 'Type of entity changed: role_permission, user_permission, permission';
COMMENT ON COLUMN siem_app.permission_audit.action IS 'Action performed: granted, revoked, created, updated, deleted';

DO $$
BEGIN
  RAISE NOTICE '✓ Created permission_audit table';
END $$;

-- ============================================================
-- Step 5: Update menu_permissions table
-- ============================================================

-- Add permission_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'menu_permissions' AND column_name = 'permission_id'
  ) THEN
    ALTER TABLE siem_app.menu_permissions
      ADD COLUMN permission_id INTEGER REFERENCES siem_app.permissions(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added permission_id to menu_permissions';
  ELSE
    RAISE NOTICE '- permission_id column already exists';
  END IF;
END $$;

-- Add role_id column if not exists (to replace role string)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app' AND table_name = 'menu_permissions' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE siem_app.menu_permissions
      ADD COLUMN role_id INTEGER REFERENCES siem_app.roles(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added role_id to menu_permissions';
  ELSE
    RAISE NOTICE '- role_id column already exists';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_menu_permissions_permission ON siem_app.menu_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_role_id ON siem_app.menu_permissions(role_id);

COMMENT ON COLUMN siem_app.menu_permissions.role IS '[DEPRECATED] Use role_id instead';
COMMENT ON COLUMN siem_app.menu_permissions.role_id IS 'Role that can access this menu (alternative to permission_id)';
COMMENT ON COLUMN siem_app.menu_permissions.permission_id IS 'Permission required to access this menu (preferred method)';

-- ============================================================
-- Step 6: Create helper function to check user permissions
-- ============================================================

CREATE OR REPLACE FUNCTION siem_app.user_has_permission(
  p_user_id INTEGER,
  p_permission_code VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_permission_id INTEGER;
BEGIN
  -- Get permission ID
  SELECT id INTO v_permission_id
  FROM siem_app.permissions
  WHERE code = p_permission_code AND is_active = true;

  IF v_permission_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check user-specific override first (highest priority)
  SELECT is_granted INTO v_has_permission
  FROM siem_app.user_permissions
  WHERE user_id = p_user_id
    AND permission_id = v_permission_id
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

  IF FOUND THEN
    RETURN v_has_permission;
  END IF;

  -- Check role permissions
  SELECT EXISTS (
    SELECT 1
    FROM siem_app.users u
    JOIN siem_app.role_permissions rp ON u.role_id = rp.role_id
    WHERE u.id = p_user_id
      AND rp.permission_id = v_permission_id
      AND rp.is_granted = true
  ) INTO v_has_permission;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION siem_app.user_has_permission IS 'Check if user has specific permission (checks overrides and role permissions)';

DO $$
BEGIN
  RAISE NOTICE '✓ Created user_has_permission() function';
END $$;

-- ============================================================
-- Step 7: Create function to get all user permissions
-- ============================================================

CREATE OR REPLACE FUNCTION siem_app.get_user_permissions(p_user_id INTEGER)
RETURNS TABLE (
  permission_id INTEGER,
  permission_code VARCHAR(100),
  permission_name JSONB,
  resource VARCHAR(50),
  action VARCHAR(20),
  scope VARCHAR(50),
  source VARCHAR(20) -- 'role' or 'user_override'
) AS $$
BEGIN
  RETURN QUERY
  -- Permissions from role
  SELECT DISTINCT
    p.id,
    p.code,
    p.name,
    p.resource,
    p.action,
    p.scope,
    'role'::VARCHAR(20) as source
  FROM siem_app.users u
  JOIN siem_app.role_permissions rp ON u.role_id = rp.role_id
  JOIN siem_app.permissions p ON rp.permission_id = p.id
  WHERE u.id = p_user_id
    AND rp.is_granted = true
    AND p.is_active = true
    AND p.id NOT IN (
      -- Exclude if denied by user override
      SELECT up.permission_id
      FROM siem_app.user_permissions up
      WHERE up.user_id = p_user_id
        AND up.is_granted = false
        AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
    )

  UNION

  -- Additional permissions from user overrides
  SELECT DISTINCT
    p.id,
    p.code,
    p.name,
    p.resource,
    p.action,
    p.scope,
    'user_override'::VARCHAR(20) as source
  FROM siem_app.user_permissions up
  JOIN siem_app.permissions p ON up.permission_id = p.id
  WHERE up.user_id = p_user_id
    AND up.is_granted = true
    AND p.is_active = true
    AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION siem_app.get_user_permissions IS 'Get all effective permissions for a user (role + overrides)';

DO $$
BEGIN
  RAISE NOTICE '✓ Created get_user_permissions() function';
END $$;

-- ============================================================
-- Step 8: Create function to get user's accessible menus
-- ============================================================

CREATE OR REPLACE FUNCTION siem_app.get_user_accessible_menus(p_user_id INTEGER)
RETURNS TABLE (
  menu_item_id INTEGER,
  menu_path VARCHAR(255),
  access_type VARCHAR(50) -- 'role', 'permission', 'public'
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    mi.id as menu_item_id,
    mi.path as menu_path,
    CASE
      WHEN mp.role_id IS NOT NULL THEN 'role'
      WHEN mp.permission_id IS NOT NULL THEN 'permission'
      ELSE 'public'
    END::VARCHAR(50) as access_type
  FROM siem_app.menu_items mi
  LEFT JOIN siem_app.menu_permissions mp ON mi.id = mp.menu_item_id
  LEFT JOIN siem_app.users u ON u.id = p_user_id
  WHERE mp.id IS NULL -- Public menu (no permission required)
     OR (mp.role_id IS NOT NULL AND mp.role_id = u.role_id) -- Role-based access
     OR (mp.permission_id IS NOT NULL AND siem_app.user_has_permission(p_user_id, (
       SELECT code FROM siem_app.permissions WHERE id = mp.permission_id
     ))) -- Permission-based access
  ORDER BY mi.id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION siem_app.get_user_accessible_menus IS 'Get all menu items accessible by user based on role and permissions';

DO $$
BEGIN
  RAISE NOTICE '✓ Created get_user_accessible_menus() function';
END $$;

-- ============================================================
-- Step 9: Verification and Summary
-- ============================================================

DO $$
DECLARE
  perm_count INTEGER;
  role_perm_count INTEGER;
  table_count INTEGER;
  func_count INTEGER;
BEGIN
  -- Count data
  SELECT COUNT(*) INTO perm_count FROM siem_app.permissions;
  SELECT COUNT(*) INTO role_perm_count FROM siem_app.role_permissions;

  -- Count new tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'siem_app'
    AND table_name IN ('permissions', 'role_permissions', 'user_permissions', 'permission_audit', 'menu_permissions');

  -- Count functions
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN ('user_has_permission', 'get_user_permissions', 'get_user_accessible_menus')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'siem_app');

  RAISE NOTICE '';
  RAISE NOTICE '=== RBAC System Enhancement Complete ===';
  RAISE NOTICE 'Tables: % (permissions, role_permissions, user_permissions, permission_audit, menu_permissions)', table_count;
  RAISE NOTICE 'Functions: %', func_count;
  RAISE NOTICE '  - user_has_permission(user_id, permission_code)';
  RAISE NOTICE '  - get_user_permissions(user_id)';
  RAISE NOTICE '  - get_user_accessible_menus(user_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Data Summary:';
  RAISE NOTICE '  - Permissions: %', perm_count;
  RAISE NOTICE '  - Role-Permission mappings: %', role_perm_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Assign permissions to roles (role_permissions)';
  RAISE NOTICE '  2. Link menus to permissions (menu_permissions)';
  RAISE NOTICE '  3. Implement API endpoints';
  RAISE NOTICE '  4. Create admin UI components';
END $$;

COMMIT;

-- Display enhanced table structures
\echo ''
\echo '=== Enhanced permissions table ==='
\d siem_app.permissions

\echo ''
\echo '=== Enhanced role_permissions table ==='
\d siem_app.role_permissions

\echo ''
\echo '=== New user_permissions table ==='
\d siem_app.user_permissions

\echo ''
\echo '=== New permission_audit table ==='
\d siem_app.permission_audit
