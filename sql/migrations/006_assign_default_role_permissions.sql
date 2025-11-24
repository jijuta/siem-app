-- ============================================================
-- Migration: Assign Default Permissions to Roles
-- Date: 2025-11-25
-- Purpose: Map all permissions to appropriate roles
-- ============================================================
--
-- Role Hierarchy:
-- 1. super_admin (level 100): ALL permissions
-- 2. admin (level 80): Company-level management
-- 3. manager (level 60): Department-level management
-- 4. editor (level 40): Can edit data
-- 5. viewer (level 20): Read-only access
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Clear existing role_permissions (for clean setup)
-- ============================================================

-- Keep audit trail before clearing
INSERT INTO siem_app.permission_audit (
  entity_type, entity_id, action, role_id, permission_id,
  changed_by, old_value, reason, created_at
)
SELECT
  'role_permission',
  rp.id,
  'cleared_for_rebuild',
  rp.role_id,
  rp.permission_id,
  NULL,
  jsonb_build_object(
    'role_id', rp.role_id,
    'permission_id', rp.permission_id,
    'is_granted', rp.is_granted
  ),
  'Clearing for complete permission rebuild',
  CURRENT_TIMESTAMP
FROM siem_app.role_permissions rp;

-- Clear existing mappings
DELETE FROM siem_app.role_permissions;

DO $$
BEGIN
  RAISE NOTICE '✓ Cleared existing role_permissions (backed up to audit log)';
END $$;

-- ============================================================
-- Step 2: Grant ALL permissions to super_admin
-- ============================================================

INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  1, -- super_admin role_id
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true;

DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  GET DIAGNOSTICS perm_count = ROW_COUNT;
  RAISE NOTICE '✓ Granted % permissions to super_admin', perm_count;
END $$;

-- ============================================================
-- Step 3: Grant permissions to admin (COMPANY scope)
-- ============================================================

-- Admin can manage companies, departments, users
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  2, -- admin role_id
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource IN ('companies', 'departments', 'users', 'roles')
  AND p.action IN ('create', 'read', 'update', 'delete')
  AND p.scope IN ('COMPANY', 'ALL');

-- Admin can read menus and audit logs
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  2,
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource IN ('menus', 'audit_logs')
  AND p.action = 'read';

DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM siem_app.role_permissions WHERE role_id = 2;
  RAISE NOTICE '✓ Granted % permissions to admin', perm_count;
END $$;

-- ============================================================
-- Step 4: Grant permissions to manager (DEPARTMENT scope)
-- ============================================================

-- Manager can manage departments and users in their department
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  3, -- manager role_id
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource IN ('departments', 'users')
  AND p.action IN ('read', 'update')
  AND p.scope IN ('DEPARTMENT', 'COMPANY');

-- Manager can read companies and menus
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  3,
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource IN ('companies', 'menus')
  AND p.action = 'read';

DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM siem_app.role_permissions WHERE role_id = 3;
  RAISE NOTICE '✓ Granted % permissions to manager', perm_count;
END $$;

-- ============================================================
-- Step 5: Grant permissions to editor
-- ============================================================

-- Editor can read and update (but not create/delete)
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  4, -- editor role_id
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource IN ('companies', 'departments', 'users')
  AND p.action IN ('read', 'update');

-- Editor can read menus
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  4,
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.resource = 'menus'
  AND p.action = 'read';

DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM siem_app.role_permissions WHERE role_id = 4;
  RAISE NOTICE '✓ Granted % permissions to editor', perm_count;
END $$;

-- ============================================================
-- Step 6: Grant permissions to viewer (read-only)
-- ============================================================

-- Viewer can only read
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  5, -- viewer role_id
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.permissions p
WHERE p.is_active = true
  AND p.action = 'read';

DO $$
DECLARE
  perm_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM siem_app.role_permissions WHERE role_id = 5;
  RAISE NOTICE '✓ Granted % permissions to viewer', perm_count;
END $$;

-- ============================================================
-- Step 7: Add additional SIEM-specific permissions
-- ============================================================

-- Add incident/alert/dashboard permissions if not exist
INSERT INTO siem_app.permissions (code, resource, action, name, description, scope, category, is_system, is_active)
VALUES
  -- Incident management
  ('incidents.read', 'incidents', 'read',
   '{"ko": "인시던트 조회", "en": "Read Incidents", "ja": "インシデント閲覧", "zh": "查看事件"}',
   '{"ko": "인시던트 조회 권한", "en": "Permission to read incidents", "ja": "インシデント閲覧権限", "zh": "查看事件权限"}',
   'COMPANY', 'security', true, true),

  ('incidents.update', 'incidents', 'update',
   '{"ko": "인시던트 수정", "en": "Update Incidents", "ja": "インシデント編集", "zh": "更新事件"}',
   '{"ko": "인시던트 수정 권한", "en": "Permission to update incidents", "ja": "インシデント編集権限", "zh": "更新事件权限"}',
   'COMPANY', 'security', true, true),

  ('incidents.export', 'incidents', 'export',
   '{"ko": "인시던트 내보내기", "en": "Export Incidents", "ja": "インシデントエクスポート", "zh": "导出事件"}',
   '{"ko": "인시던트 내보내기 권한", "en": "Permission to export incidents", "ja": "インシデントエクスポート権限", "zh": "导出事件权限"}',
   'COMPANY', 'security', true, true),

  -- Alert management
  ('alerts.read', 'alerts', 'read',
   '{"ko": "알림 조회", "en": "Read Alerts", "ja": "アラート閲覧", "zh": "查看警报"}',
   '{"ko": "알림 조회 권한", "en": "Permission to read alerts", "ja": "アラート閲覧権限", "zh": "查看警报权限"}',
   'COMPANY', 'security', true, true),

  ('alerts.update', 'alerts', 'update',
   '{"ko": "알림 수정", "en": "Update Alerts", "ja": "アラート編集", "zh": "更新警报"}',
   '{"ko": "알림 수정 권한", "en": "Permission to update alerts", "ja": "アラート編集権限", "zh": "更新警报权限"}',
   'COMPANY', 'security', true, true),

  -- Dashboard management
  ('dashboards.read', 'dashboards', 'read',
   '{"ko": "대시보드 조회", "en": "Read Dashboards", "ja": "ダッシュボード閲覧", "zh": "查看仪表板"}',
   '{"ko": "대시보드 조회 권한", "en": "Permission to read dashboards", "ja": "ダッシュボード閲覧権限", "zh": "查看仪表板权限"}',
   'COMPANY', 'analysis', true, true),

  ('dashboards.create', 'dashboards', 'create',
   '{"ko": "대시보드 생성", "en": "Create Dashboards", "ja": "ダッシュボード作成", "zh": "创建仪表板"}',
   '{"ko": "대시보드 생성 권한", "en": "Permission to create dashboards", "ja": "ダッシュボード作成権限", "zh": "创建仪表板权限"}',
   'OWN', 'analysis', true, true),

  -- Report management
  ('reports.read', 'reports', 'read',
   '{"ko": "리포트 조회", "en": "Read Reports", "ja": "レポート閲覧", "zh": "查看报告"}',
   '{"ko": "리포트 조회 권한", "en": "Permission to read reports", "ja": "レポート閲覧権限", "zh": "查看报告权限"}',
   'COMPANY', 'reports', true, true),

  ('reports.create', 'reports', 'create',
   '{"ko": "리포트 생성", "en": "Create Reports", "ja": "レポート作成", "zh": "创建报告"}',
   '{"ko": "리포트 생성 권한", "en": "Permission to create reports", "ja": "レポート作成権限", "zh": "创建报告权限"}',
   'COMPANY', 'reports', true, true),

  ('reports.export', 'reports', 'export',
   '{"ko": "리포트 내보내기", "en": "Export Reports", "ja": "レポートエクスポート", "zh": "导出报告"}',
   '{"ko": "리포트 내보내기 권한", "en": "Permission to export reports", "ja": "レポートエクスポート権限", "zh": "导出报告权限"}',
   'COMPANY', 'reports', true, true)

ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
  new_perm_count INTEGER;
BEGIN
  GET DIAGNOSTICS new_perm_count = ROW_COUNT;
  IF new_perm_count > 0 THEN
    RAISE NOTICE '✓ Added % new SIEM-specific permissions', new_perm_count;
  ELSE
    RAISE NOTICE '- SIEM permissions already exist';
  END IF;
END $$;

-- Grant SIEM permissions to appropriate roles
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  r.id,
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.roles r
CROSS JOIN siem_app.permissions p
WHERE p.code IN ('incidents.read', 'alerts.read', 'dashboards.read', 'reports.read')
  AND p.id NOT IN (
    SELECT permission_id FROM siem_app.role_permissions WHERE role_id = r.id
  );

-- Grant write permissions to admin and super_admin
INSERT INTO siem_app.role_permissions (role_id, permission_id, is_granted, granted_at)
SELECT
  r.id,
  p.id,
  true,
  CURRENT_TIMESTAMP
FROM siem_app.roles r
CROSS JOIN siem_app.permissions p
WHERE r.code IN ('super_admin', 'admin')
  AND p.resource IN ('incidents', 'alerts', 'dashboards', 'reports')
  AND p.action IN ('update', 'create', 'export')
  AND p.id NOT IN (
    SELECT permission_id FROM siem_app.role_permissions WHERE role_id = r.id
  );

DO $$
BEGIN
  RAISE NOTICE '✓ Assigned SIEM permissions to roles';
END $$;

-- ============================================================
-- Step 8: Summary and Verification
-- ============================================================

DO $$
DECLARE
  total_perms INTEGER;
  super_admin_perms INTEGER;
  admin_perms INTEGER;
  manager_perms INTEGER;
  editor_perms INTEGER;
  viewer_perms INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_perms FROM siem_app.permissions WHERE is_active = true;
  SELECT COUNT(*) INTO super_admin_perms FROM siem_app.role_permissions WHERE role_id = 1;
  SELECT COUNT(*) INTO admin_perms FROM siem_app.role_permissions WHERE role_id = 2;
  SELECT COUNT(*) INTO manager_perms FROM siem_app.role_permissions WHERE role_id = 3;
  SELECT COUNT(*) INTO editor_perms FROM siem_app.role_permissions WHERE role_id = 4;
  SELECT COUNT(*) INTO viewer_perms FROM siem_app.role_permissions WHERE role_id = 5;

  RAISE NOTICE '';
  RAISE NOTICE '=== Role-Permission Assignment Complete ===';
  RAISE NOTICE 'Total Active Permissions: %', total_perms;
  RAISE NOTICE '';
  RAISE NOTICE 'Permissions by Role:';
  RAISE NOTICE '  super_admin: % permissions (ALL)', super_admin_perms;
  RAISE NOTICE '  admin:       % permissions', admin_perms;
  RAISE NOTICE '  manager:     % permissions', manager_perms;
  RAISE NOTICE '  editor:      % permissions', editor_perms;
  RAISE NOTICE '  viewer:      % permissions (read-only)', viewer_perms;
  RAISE NOTICE '';
END $$;

COMMIT;

-- Display permission summary by role
\echo ''
\echo '=== Permission Summary by Role ==='
SELECT
  r.code as role,
  r.name->>'ko' as role_name_ko,
  COUNT(rp.id) as total_permissions,
  COUNT(*) FILTER (WHERE p.action = 'read') as read_perms,
  COUNT(*) FILTER (WHERE p.action = 'create') as create_perms,
  COUNT(*) FILTER (WHERE p.action = 'update') as update_perms,
  COUNT(*) FILTER (WHERE p.action = 'delete') as delete_perms,
  COUNT(*) FILTER (WHERE p.action IN ('export', 'manage')) as other_perms
FROM siem_app.roles r
LEFT JOIN siem_app.role_permissions rp ON r.id = rp.role_id AND rp.is_granted = true
LEFT JOIN siem_app.permissions p ON rp.permission_id = p.id AND p.is_active = true
GROUP BY r.id, r.code, r.name
ORDER BY r.level DESC;
