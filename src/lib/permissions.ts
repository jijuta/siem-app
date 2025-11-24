// ============================================================
// Permission Management Utilities
// ============================================================
// This module provides utilities for checking user permissions
// and integrating with the RBAC system.

import { query } from './db'

/**
 * Check if a user has a specific permission
 * Uses the database function for accurate permission checking
 *
 * @param userId - User ID to check
 * @param permissionCode - Permission code (e.g., 'users.create')
 * @returns true if user has permission, false otherwise
 */
export async function userHasPermission(
  userId: number | string,
  permissionCode: string
): Promise<boolean> {
  try {
    const result = await query(
      'SELECT siem_app.user_has_permission($1, $2) as has_permission',
      [userId, permissionCode]
    )
    return result.rows[0]?.has_permission || false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Check if a user has ANY of the specified permissions
 *
 * @param userId - User ID to check
 * @param permissionCodes - Array of permission codes
 * @returns true if user has at least one permission
 */
export async function userHasAnyPermission(
  userId: number | string,
  permissionCodes: string[]
): Promise<boolean> {
  for (const code of permissionCodes) {
    if (await userHasPermission(userId, code)) {
      return true
    }
  }
  return false
}

/**
 * Check if a user has ALL of the specified permissions
 *
 * @param userId - User ID to check
 * @param permissionCodes - Array of permission codes
 * @returns true if user has all permissions
 */
export async function userHasAllPermissions(
  userId: number | string,
  permissionCodes: string[]
): Promise<boolean> {
  for (const code of permissionCodes) {
    if (!(await userHasPermission(userId, code))) {
      return false
    }
  }
  return true
}

/**
 * Get all permissions for a user
 *
 * @param userId - User ID
 * @returns Array of permission objects
 */
export async function getUserPermissions(userId: number | string) {
  try {
    const result = await query(
      `SELECT
        permission_id,
        permission_code,
        permission_name,
        resource,
        action,
        scope,
        source
       FROM siem_app.get_user_permissions($1)
       ORDER BY resource, action`,
      [userId]
    )
    return result.rows
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Get accessible menu items for a user
 *
 * @param userId - User ID
 * @returns Array of accessible menu item IDs and paths
 */
export async function getUserAccessibleMenus(userId: number | string) {
  try {
    const result = await query(
      `SELECT menu_item_id, menu_path, access_type
       FROM siem_app.get_user_accessible_menus($1)`,
      [userId]
    )
    return result.rows
  } catch (error) {
    console.error('Error getting accessible menus:', error)
    return []
  }
}

/**
 * Permission requirement decorator types
 */
export type PermissionRequirement = {
  type: 'any' | 'all'
  permissions: string[]
}

/**
 * Check permission requirements
 *
 * @param userId - User ID to check
 * @param requirement - Permission requirement object
 * @returns true if requirements are met
 */
export async function checkPermissionRequirements(
  userId: number | string,
  requirement: PermissionRequirement
): Promise<boolean> {
  if (requirement.type === 'any') {
    return await userHasAnyPermission(userId, requirement.permissions)
  } else {
    return await userHasAllPermissions(userId, requirement.permissions)
  }
}

/**
 * Get user role information
 *
 * @param userId - User ID
 * @returns Role information including code, name, level
 */
export async function getUserRole(userId: number | string) {
  try {
    const result = await query(
      `SELECT r.id, r.code, r.name, r.description, r.level, r.scope
       FROM siem_app.users u
       JOIN siem_app.roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Check if user has a specific role
 *
 * @param userId - User ID to check
 * @param roleCodes - Role code(s) to check ('admin', 'super_admin', etc.)
 * @returns true if user has the role
 */
export async function userHasRole(
  userId: number | string,
  roleCodes: string | string[]
): Promise<boolean> {
  try {
    const codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes]
    const result = await query(
      `SELECT EXISTS (
        SELECT 1 FROM siem_app.users u
        JOIN siem_app.roles r ON u.role_id = r.id
        WHERE u.id = $1 AND r.code = ANY($2)
      ) as has_role`,
      [userId, codes]
    )
    return result.rows[0]?.has_role || false
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Permission constants for common operations
 */
export const Permissions = {
  // User management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Company management
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_READ: 'companies.read',
  COMPANIES_UPDATE: 'companies.update',
  COMPANIES_DELETE: 'companies.delete',

  // Department management
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // Role management
  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  // Incident management
  INCIDENTS_READ: 'incidents.read',
  INCIDENTS_UPDATE: 'incidents.update',
  INCIDENTS_EXPORT: 'incidents.export',

  // Alert management
  ALERTS_READ: 'alerts.read',
  ALERTS_UPDATE: 'alerts.update',

  // Dashboard management
  DASHBOARDS_READ: 'dashboards.read',
  DASHBOARDS_CREATE: 'dashboards.create',

  // Report management
  REPORTS_READ: 'reports.read',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',

  // Menu management
  MENUS_CREATE: 'menus.create',
  MENUS_READ: 'menus.read',
  MENUS_UPDATE: 'menus.update',
  MENUS_DELETE: 'menus.delete',

  // Audit logs
  AUDIT_LOGS_READ: 'audit_logs.read',

  // System settings
  SYSTEM_SETTINGS_READ: 'system_settings.read',
  SYSTEM_SETTINGS_UPDATE: 'system_settings.update',
} as const

/**
 * Role constants
 */
export const Roles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const
