/**
 * Menu Adapter - Converts database menu structure to existing navigation format
 * This allows backward compatibility with existing AppSidebar component
 */

import { MenuItem, Vendor, VendorPage } from '@/lib/db-menu'

/**
 * Convert database menu item to navigation format
 * NOTE: Icons are kept as strings and will be converted to components in the client
 */
export function convertMenuItem(item: MenuItem, lang: string = 'ko') {
  return {
    name: item.label[lang] || item.label.en || item.name,
    href: item.href,
    iconName: item.icon || 'Layers', // Keep as string
    badge: item.badge?.show ? item.badge.text : undefined,
    children: item.children?.map((child) => convertMenuItem(child, lang)),
  }
}

/**
 * Convert database vendor to navigation format
 * NOTE: Icons are kept as strings and will be converted to components in the client
 */
export function convertVendor(vendor: Vendor, lang: string = 'ko') {
  return {
    id: vendor.vendor_id,
    name: vendor.label[lang] || vendor.label.en || vendor.name,
    href: `/${vendor.vendor_id}`,
    iconName: vendor.icon || 'Shield', // Keep as string
    color: vendor.color || 'gray',
    description: vendor.description?.[lang] || vendor.description?.en || '',
    children: vendor.pages?.map((page) => ({
      name: page.label[lang] || page.label.en || page.name,
      href: page.href,
    })) || [],
  }
}

/**
 * Convert full navigation structure from database format to AppSidebar format
 * Groups menu items by category for easier rendering
 */
export function convertNavigationStructure(
  data: {
    categories: any[]
    menuItems: MenuItem[]
    vendors: Vendor[]
  },
  lang: string = 'ko'
) {
  // Group menu items by category
  const categorizedMenus: Record<string, any[]> = {}

  data.categories.forEach((category) => {
    const categoryItems = data.menuItems
      .filter((item) => item.category_id === category.id && !item.parent_id)
      .map((item) => convertMenuItem(item, lang))

    categorizedMenus[category.name] = {
      id: category.id,
      name: category.name,
      label: category.label[lang] || category.label.en || category.name,
      icon: category.icon,
      order: category.order_index,
      items: categoryItems,
    }
  })

  return {
    categories: Object.values(categorizedMenus).sort((a, b) => a.order - b.order),
    vendors: data.vendors.map((vendor) => convertVendor(vendor, lang)),
    // Legacy support: flatten all items into main array
    main: data.menuItems.map((item) => convertMenuItem(item, lang)),
  }
}
