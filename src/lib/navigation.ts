import {
  LayoutDashboard,
  Search,
  ChartBar,
  Shield,
  Network,
  Lock,
  Brain,
  Settings,
  Bell,
  FileText,
  Users,
  Activity,
  Server,
  Cloud,
  AlertTriangle
} from 'lucide-react'

export const navigation = {
  main: [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBar,
      children: [
        { name: 'Sigma Rules', href: '/analytics/sigma-rules' },
        { name: 'MITRE ATT&CK', href: '/analytics/mitre-attack' },
        { name: 'Reports', href: '/analytics/reports' },
      ]
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: Bell,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      children: [
        { name: 'Profile', href: '/settings/profile' },
        { name: 'Alert Configuration', href: '/settings/alerts' },
        { name: 'API Keys', href: '/settings/api-keys' },
      ]
    }
  ],
  // Vendors are now loaded from database via API - see siem_app.vendors table
  // This static array is kept empty to avoid duplication with DB data
  vendors: []
}

export type NavigationItem = typeof navigation.main[0]
// VendorItem type is now defined based on database schema
export type VendorItem = {
  id: string
  name: string
  href: string
  icon: any
  iconName?: string
  color: string
  description: string
  children?: { name: string; href: string }[]
}