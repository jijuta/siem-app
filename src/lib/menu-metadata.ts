/**
 * Menu Metadata Utility
 * Fetches menu information from database and provides it to pages for header construction
 */

import { pool } from './db-menu'

export interface MenuMetadata {
  name: string
  label: Record<string, string>
  description: Record<string, string> | null
  icon: string | null
  href: string
  category?: string
}

/**
 * Get menu metadata by href path
 * Used by pages to construct headers dynamically from menu data
 */
export async function getMenuMetadataByPath(
  path: string,
  lang: string = 'ko'
): Promise<MenuMetadata | null> {
  try {
    // Try to find in menu_items first
    const menuResult = await pool.query(
      `SELECT
        mi.name,
        mi.label,
        mi.description,
        mi.icon,
        mi.href,
        mc.name as category
       FROM siem_app.menu_items mi
       LEFT JOIN siem_app.menu_categories mc ON mi.category_id = mc.id
       WHERE mi.href = $1 AND mi.is_active = true
       LIMIT 1`,
      [path]
    )

    if (menuResult.rows.length > 0) {
      return menuResult.rows[0]
    }

    // If not found in menu_items, try vendors
    const vendorResult = await pool.query(
      `SELECT
        v.name,
        v.label,
        v.description,
        v.icon,
        CONCAT('/', v.vendor_id) as href
       FROM siem_app.vendors v
       WHERE CONCAT('/', v.vendor_id) = $1 AND v.is_active = true
       LIMIT 1`,
      [path]
    )

    if (vendorResult.rows.length > 0) {
      return {
        ...vendorResult.rows[0],
        category: 'vendors'
      }
    }

    // Try vendor_pages
    const vendorPageResult = await pool.query(
      `SELECT
        vp.name,
        vp.label,
        jsonb_build_object('ko', '', 'en', '') as description,
        NULL as icon,
        vp.href,
        v.name as category
       FROM siem_app.vendor_pages vp
       JOIN siem_app.vendors v ON vp.vendor_id = v.id
       WHERE vp.href = $1 AND vp.is_active = true
       LIMIT 1`,
      [path]
    )

    if (vendorPageResult.rows.length > 0) {
      return vendorPageResult.rows[0]
    }

    return null
  } catch (error) {
    console.error('Error fetching menu metadata:', error)
    return null
  }
}

/**
 * Get localized menu metadata
 * Returns the menu info in the requested language
 */
export function getLocalizedMetadata(
  metadata: MenuMetadata | null,
  lang: string = 'ko'
): {
  title: string
  description: string
  icon: string | null
  category: string | null
} {
  if (!metadata) {
    return {
      title: 'Page',
      description: '',
      icon: null,
      category: null
    }
  }

  return {
    title: metadata.label[lang] || metadata.label.en || metadata.name,
    description: metadata.description?.[lang] || metadata.description?.en || '',
    icon: metadata.icon,
    category: metadata.category || null
  }
}
