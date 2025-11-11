import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL?.replace('?schema=public', ''),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export interface MenuCategory {
  id: number
  name: string
  label: Record<string, string>
  icon: string | null
  color: string | null
  order_index: number
  is_active: boolean
}

export interface MenuItem {
  id: number
  category_id: number | null
  parent_id: number | null
  name: string
  label: Record<string, string>
  href: string
  icon: string | null
  description: Record<string, string> | null
  order_index: number
  is_active: boolean
  badge: { text: string; variant: string; show: boolean } | null
  children?: MenuItem[]
}

export interface Vendor {
  id: number
  vendor_id: string
  name: string
  label: Record<string, string>
  icon: string | null
  color: string | null
  description: Record<string, string> | null
  is_active: boolean
  order_index: number
  pages?: VendorPage[]
}

export interface VendorPage {
  id: number
  vendor_id: number
  name: string
  label: Record<string, string>
  href: string
  order_index: number
  is_active: boolean
}

/**
 * Get all active menu categories
 */
export async function getMenuCategories(): Promise<MenuCategory[]> {
  const result = await pool.query(
    'SELECT * FROM siem_app.menu_categories WHERE is_active = true ORDER BY order_index ASC'
  )
  return result.rows
}

/**
 * Get all menu items with hierarchical structure
 * Sorted by category order first, then item order
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  const result = await pool.query(
    `SELECT mi.*
     FROM siem_app.menu_items mi
     LEFT JOIN siem_app.menu_categories mc ON mi.category_id = mc.id
     WHERE mi.is_active = true
     ORDER BY mc.order_index ASC, mi.order_index ASC`
  )

  const items = result.rows
  const itemMap = new Map<number, MenuItem>()
  const rootItems: MenuItem[] = []

  // First pass: create map of all items
  items.forEach((item: MenuItem) => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // Second pass: build hierarchy
  items.forEach((item: MenuItem) => {
    const menuItem = itemMap.get(item.id)!
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(menuItem)
      }
    } else {
      rootItems.push(menuItem)
    }
  })

  return rootItems
}

/**
 * Get menu items by category
 */
export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
  const result = await pool.query(
    `SELECT * FROM siem_app.menu_items
     WHERE category_id = $1 AND is_active = true
     ORDER BY order_index ASC`,
    [categoryId]
  )
  return result.rows
}

/**
 * Get all active vendors
 */
export async function getVendors(): Promise<Vendor[]> {
  const result = await pool.query(
    'SELECT * FROM siem_app.vendors WHERE is_active = true ORDER BY order_index ASC'
  )
  return result.rows
}

/**
 * Get vendor by vendor_id
 */
export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  const result = await pool.query(
    'SELECT * FROM siem_app.vendors WHERE vendor_id = $1 AND is_active = true',
    [vendorId]
  )
  return result.rows[0] || null
}

/**
 * Get vendor pages for a specific vendor
 */
export async function getVendorPages(vendorId: number): Promise<VendorPage[]> {
  const result = await pool.query(
    `SELECT * FROM siem_app.vendor_pages
     WHERE vendor_id = $1 AND is_active = true
     ORDER BY order_index ASC`,
    [vendorId]
  )
  return result.rows
}

/**
 * Get all vendors with their pages
 */
export async function getVendorsWithPages(): Promise<Vendor[]> {
  const vendors = await getVendors()

  for (const vendor of vendors) {
    vendor.pages = await getVendorPages(vendor.id)
  }

  return vendors
}

/**
 * Get complete navigation structure
 */
export async function getNavigationStructure() {
  const [categories, menuItems, vendors] = await Promise.all([
    getMenuCategories(),
    getMenuItems(),
    getVendorsWithPages(),
  ])

  return {
    categories,
    menuItems,
    vendors,
  }
}

/**
 * Create a new menu item
 */
export async function createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
  const result = await pool.query(
    `INSERT INTO siem_app.menu_items
     (category_id, parent_id, name, label, href, icon, description, order_index, is_active, badge)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.category_id || null,
      data.parent_id || null,
      data.name,
      JSON.stringify(data.label),
      data.href,
      data.icon || null,
      data.description ? JSON.stringify(data.description) : null,
      data.order_index || 0,
      data.is_active ?? true,
      data.badge ? JSON.stringify(data.badge) : null,
    ]
  )
  return result.rows[0]
}

/**
 * Update a menu item
 */
export async function updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.label !== undefined) {
    updates.push(`label = $${paramIndex++}`)
    values.push(JSON.stringify(data.label))
  }
  if (data.href !== undefined) {
    updates.push(`href = $${paramIndex++}`)
    values.push(data.href)
  }
  if (data.icon !== undefined) {
    updates.push(`icon = $${paramIndex++}`)
    values.push(data.icon)
  }
  if (data.order_index !== undefined) {
    updates.push(`order_index = $${paramIndex++}`)
    values.push(data.order_index)
  }
  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`)
    values.push(data.is_active)
  }
  if (data.badge !== undefined) {
    updates.push(`badge = $${paramIndex++}`)
    values.push(data.badge ? JSON.stringify(data.badge) : null)
  }

  values.push(id)
  const result = await pool.query(
    `UPDATE siem_app.menu_items
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  )
  return result.rows[0]
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: number): Promise<void> {
  await pool.query('DELETE FROM siem_app.menu_items WHERE id = $1', [id])
}

/**
 * Create a new vendor
 */
export async function createVendor(data: Partial<Vendor>): Promise<Vendor> {
  const result = await pool.query(
    `INSERT INTO siem_app.vendors
     (vendor_id, name, label, icon, color, description, is_active, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.vendor_id,
      data.name,
      JSON.stringify(data.label),
      data.icon || null,
      data.color || null,
      data.description ? JSON.stringify(data.description) : null,
      data.is_active ?? true,
      data.order_index || 0,
    ]
  )
  return result.rows[0]
}

/**
 * Update a vendor
 */
export async function updateVendor(id: number, data: Partial<Vendor>): Promise<Vendor> {
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.label !== undefined) {
    updates.push(`label = $${paramIndex++}`)
    values.push(JSON.stringify(data.label))
  }
  if (data.icon !== undefined) {
    updates.push(`icon = $${paramIndex++}`)
    values.push(data.icon)
  }
  if (data.color !== undefined) {
    updates.push(`color = $${paramIndex++}`)
    values.push(data.color)
  }
  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`)
    values.push(data.is_active)
  }
  if (data.order_index !== undefined) {
    updates.push(`order_index = $${paramIndex++}`)
    values.push(data.order_index)
  }

  values.push(id)
  const result = await pool.query(
    `UPDATE siem_app.vendors
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  )
  return result.rows[0]
}

export { pool }
