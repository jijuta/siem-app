/**
 * Icon Mapper - Converts icon names to Lucide React components
 * Used by client components to resolve icon strings to components
 */

import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

/**
 * Map icon name string to Lucide React component
 */
export function getIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return LucideIcons.Layers

  // @ts-ignore - Dynamic icon lookup
  const IconComponent = LucideIcons[iconName]

  return IconComponent || LucideIcons.Layers
}

/**
 * Process navigation data and convert iconName strings to icon components
 */
export function hydrateNavigationIcons(navigation: any) {
  return {
    categories: navigation.categories?.map((category: any) => ({
      ...category,
      icon: getIconComponent(category.icon),
      items: category.items?.map((item: any) => ({
        ...item,
        icon: getIconComponent(item.iconName),
        children: item.children?.map((child: any) => ({
          ...child,
          icon: getIconComponent(child.iconName),
        })),
      })) || [],
    })) || [],
    main: navigation.main?.map((item: any) => ({
      ...item,
      icon: getIconComponent(item.iconName),
      children: item.children?.map((child: any) => ({
        ...child,
        icon: getIconComponent(child.iconName),
      })),
    })) || [],
    vendors: navigation.vendors?.map((vendor: any) => ({
      ...vendor,
      icon: getIconComponent(vendor.iconName),
    })) || [],
  }
}
