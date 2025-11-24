'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Filter } from 'lucide-react'
import PermissionsTable from './permissions-table'
import PermissionDialog from './permission-dialog'
import { useToast } from '@/components/ui/use-toast'

export interface Permission {
  id: number
  code: string
  resource: string
  action: string
  name: {
    ko: string
    en: string
    ja: string
    zh: string
  }
  description?: {
    ko: string
    en: string
    ja: string
    zh: string
  }
  scope: string
  category: string | null
  is_system: boolean
  is_active: boolean
  created_at: string
  role_count: number
  user_override_count: number
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'system_admin', label: 'System Admin' },
  { value: 'security', label: 'Security' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'reports', label: 'Reports' },
]

const RESOURCES = [
  { value: 'all', label: 'All Resources' },
  { value: 'users', label: 'Users' },
  { value: 'companies', label: 'Companies' },
  { value: 'departments', label: 'Departments' },
  { value: 'roles', label: 'Roles' },
  { value: 'menus', label: 'Menus' },
  { value: 'incidents', label: 'Incidents' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'dashboards', label: 'Dashboards' },
  { value: 'reports', label: 'Reports' },
  { value: 'audit_logs', label: 'Audit Logs' },
  { value: 'system_settings', label: 'System Settings' },
]

export default function PermissionsManagement() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedResource, setSelectedResource] = useState('all')
  const [showDialog, setShowDialog] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const { toast } = useToast()

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedResource !== 'all') {
        params.append('resource', selectedResource)
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/admin/permissions?${params}`)
      const data = await response.json()

      if (data.success) {
        setPermissions(data.permissions)
        setFilteredPermissions(data.permissions)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch permissions',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Fetch permissions error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPermissions()
  }, [selectedCategory, selectedResource])

  // Filter by search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPermissions(permissions)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = permissions.filter(
      (perm) =>
        perm.code.toLowerCase().includes(query) ||
        perm.resource.toLowerCase().includes(query) ||
        perm.action.toLowerCase().includes(query) ||
        perm.name.ko.toLowerCase().includes(query) ||
        perm.name.en.toLowerCase().includes(query)
    )
    setFilteredPermissions(filtered)
  }, [searchQuery, permissions])

  // Handle create new permission
  const handleCreate = () => {
    setEditingPermission(null)
    setShowDialog(true)
  }

  // Handle edit permission
  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setShowDialog(true)
  }

  // Handle delete permission
  const handleDelete = async (permissionId: number) => {
    if (!confirm('Are you sure you want to delete this permission?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/permissions/${permissionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Permission deleted successfully',
        })
        fetchPermissions()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete permission',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete permission error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete permission',
        variant: 'destructive',
      })
    }
  }

  // Handle dialog save
  const handleSave = () => {
    setShowDialog(false)
    fetchPermissions()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Resource Filter */}
        <Select value={selectedResource} onValueChange={setSelectedResource}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCES.map((res) => (
              <SelectItem key={res.value} value={res.value}>
                {res.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Create Button */}
        <Button onClick={handleCreate} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Create Permission
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Permissions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {permissions.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {permissions.filter((p) => p.is_active).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">System Permissions</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {permissions.filter((p) => p.is_system).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {filteredPermissions.length}
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <PermissionsTable
        permissions={filteredPermissions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Dialog */}
      {showDialog && (
        <PermissionDialog
          permission={editingPermission}
          open={showDialog}
          onClose={() => setShowDialog(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
