-- ============================================================
-- Migration: Create Complete RBAC Permission System
-- Date: 2025-11-25
-- Purpose: Implement fine-grained permission management
-- ============================================================
--
-- RBAC Structure:
-- 1. permissions: Define what actions can be performed (CRUD on resources)
-- 2. role_permissions: Map permissions to roles
-- 3. menu_permissions: Link menu items to required permissions
-- 4. users → roles → permissions → menu access
--
-- Multi-language: All labels in JSONB (ko, en, ja, zh)
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Create permissions table
-- ============================================================

CREATE TABLE IF NOT EXISTS siem_app.permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name JSONB NOT NULL, -- {"ko": "...", "en": "...", "ja": "...", "zh": "..."}
  description JSONB,
  resource VARCHAR(100) NOT NULL, -- e.g., 'users', 'companies', 'incidents', 'dashboards'
  action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'export', 'manage'
  scope VARCHAR(50) DEFAULT 'COMPANY', -- 'ALL', 'COMPANY', 'DEPARTMENT', 'OWN'
  category VARCHAR(50), -- 'system_admin', 'security', 'analysis', 'reports'
  is_system BOOLEAN DEFAULT false, -- System permissions (cannot be deleted)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_resource_action UNIQUE (resource, action)
);

-- Indexes for permissions
CREATE INDEX idx_permissions_resource ON siem_app.permissions(resource);
CREATE INDEX idx_permissions_action ON siem_app.permissions(action);
CREATE INDEX idx_permissions_category ON siem_app.permissions(category);
CREATE INDEX idx_permissions_active ON siem_app.permissions(is_active);

-- Comments
COMMENT ON TABLE siem_app.permissions IS 'Defines granular permissions for RBAC system';
COMMENT ON COLUMN siem_app.permissions.code IS 'Unique permission code (e.g., users.create, incidents.read)';
COMMENT ON COLUMN siem_app.permissions.resource IS 'Resource type (e.g., users, companies, incidents)';
COMMENT ON COLUMN siem_app.permissions.action IS 'Action type (create, read, update, delete, export, manage)';
COMMENT ON COLUMN siem_app.permissions.scope IS 'Data access scope (ALL, COMPANY, DEPARTMENT, OWN)';

-- ============================================================
-- Step 2: Create role_permissions mapping table
-- ============================================================

CREATE TABLE IF NOT EXISTS siem_app.role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES siem_app.roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES siem_app.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true,
  granted_by INTEGER REFERENCES siem_app.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Indexes for role_permissions
CREATE INDEX idx_role_permissions_role ON siem_app.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON siem_app.role_permissions(permission_id);
CREATE INDEX idx_role_permissions_granted ON siem_app.role_permissions(is_granted);

COMMENT ON TABLE siem_app.role_permissions IS 'Maps permissions to roles for RBAC';
COMMENT ON COLUMN siem_app.role_permissions.is_granted IS 'Whether permission is granted (allows for deny rules)';

-- ============================================================
-- Step 3: Update menu_permissions table to use permission_id
-- ============================================================

-- Add new columns
ALTER TABLE siem_app.menu_permissions
  ADD COLUMN IF NOT EXISTS permission_id INTEGER REFERENCES siem_app.permissions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES siem_app.roles(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_permissions_permission ON siem_app.menu_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_role_id ON siem_app.menu_permissions(role_id);

-- Update constraint (allow either role or permission_id)
COMMENT ON TABLE siem_app.menu_permissions IS 'Links menu items to required permissions or roles';
COMMENT ON COLUMN siem_app.menu_permissions.role IS '[DEPRECATED] Use role_id instead';
COMMENT ON COLUMN siem_app.menu_permissions.role_id IS 'Role that can access this menu';
COMMENT ON COLUMN siem_app.menu_permissions.permission_id IS 'Permission required to access this menu';

-- ============================================================
-- Step 4: Create user_permissions table (for exceptions)
-- ============================================================

CREATE TABLE IF NOT EXISTS siem_app.user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES siem_app.users(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES siem_app.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true, -- true = grant, false = deny (override role)
  granted_by INTEGER REFERENCES siem_app.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- Optional expiration
  reason TEXT, -- Reason for exception
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_permission UNIQUE (user_id, permission_id)
);

-- Indexes for user_permissions
CREATE INDEX idx_user_permissions_user ON siem_app.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON siem_app.user_permissions(permission_id);
CREATE INDEX idx_user_permissions_granted ON siem_app.user_permissions(is_granted);
CREATE INDEX idx_user_permissions_expires ON siem_app.user_permissions(expires_at);

COMMENT ON TABLE siem_app.user_permissions IS 'User-specific permission overrides (exceptions to role permissions)';
COMMENT ON COLUMN siem_app.user_permissions.is_granted IS 'true = grant permission, false = deny permission (override role)';
COMMENT ON COLUMN siem_app.user_permissions.expires_at IS 'Optional expiration for temporary permissions';

-- ============================================================
-- Step 5: Create audit table for permission changes
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for permission_audit
CREATE INDEX idx_permission_audit_entity ON siem_app.permission_audit(entity_type, entity_id);
CREATE INDEX idx_permission_audit_permission ON siem_app.permission_audit(permission_id);
CREATE INDEX idx_permission_audit_role ON siem_app.permission_audit(role_id);
CREATE INDEX idx_permission_audit_user ON siem_app.permission_audit(user_id);
CREATE INDEX idx_permission_audit_changed_by ON siem_app.permission_audit(changed_by);
CREATE INDEX idx_permission_audit_created ON siem_app.permission_audit(created_at);

COMMENT ON TABLE siem_app.permission_audit IS 'Audit log for all permission-related changes';

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

-- ============================================================
-- Step 7: Create helper function to get user permissions
-- ============================================================

CREATE OR REPLACE FUNCTION siem_app.get_user_permissions(p_user_id INTEGER)
RETURNS TABLE (
  permission_code VARCHAR(100),
  permission_name JSONB,
  resource VARCHAR(100),
  action VARCHAR(50),
  scope VARCHAR(50),
  source VARCHAR(20) -- 'role' or 'user_override'
) AS $$
BEGIN
  RETURN QUERY
  -- Permissions from role
  SELECT DISTINCT
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

-- ============================================================
-- Step 8: Verification
-- ============================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'siem_app'
    AND table_name IN ('permissions', 'role_permissions', 'user_permissions', 'permission_audit');

  IF table_count = 4 THEN
    RAISE NOTICE '✓ All 4 RBAC tables created successfully';
  ELSE
    RAISE EXCEPTION 'Expected 4 tables, found %', table_count;
  END IF;

  -- Check functions
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_has_permission') THEN
    RAISE NOTICE '✓ Function user_has_permission created';
  ELSE
    RAISE EXCEPTION 'Function user_has_permission not found';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_permissions') THEN
    RAISE NOTICE '✓ Function get_user_permissions created';
  ELSE
    RAISE EXCEPTION 'Function get_user_permissions not found';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== RBAC System Created ===';
  RAISE NOTICE 'Tables: permissions, role_permissions, user_permissions, permission_audit';
  RAISE NOTICE 'Functions: user_has_permission(), get_user_permissions()';
  RAISE NOTICE 'Next: Insert default permissions and role mappings';
END $$;

COMMIT;

-- ============================================================
-- Display new table structures
-- ============================================================

\echo ''
\echo '=== permissions table ==='
\d siem_app.permissions

\echo ''
\echo '=== role_permissions table ==='
\d siem_app.role_permissions

\echo ''
\echo '=== user_permissions table ==='
\d siem_app.user_permissions

\echo ''
\echo '=== permission_audit table ==='
\d siem_app.permission_audit
