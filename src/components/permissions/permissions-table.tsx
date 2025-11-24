'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Shield, Users, UserPlus } from 'lucide-react'
import { Permission } from './permissions-management'

interface PermissionsTableProps {
  permissions: Permission[]
  loading: boolean
  onEdit: (permission: Permission) => void
  onDelete: (permissionId: number) => void
}

export default function PermissionsTable({
  permissions,
  loading,
  onEdit,
  onDelete,
}: PermissionsTableProps) {
  const [sortField, setSortField] = useState<'resource' | 'action'>('resource')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Sort permissions
  const sortedPermissions = [...permissions].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    const compare = aVal.localeCompare(bVal)
    return sortOrder === 'asc' ? compare : -compare
  })

  // Get badge color by action
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'export':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'manage':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Get scope badge
  const getScopeBadge = (scope: string) => {
    const colors = {
      ALL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      COMPANY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      DEPARTMENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      OWN: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    return colors[scope as keyof typeof colors] || colors.COMPANY
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Loading permissions...
        </div>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No permissions found
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => {
                if (sortField === 'resource') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortField('resource')
                  setSortOrder('asc')
                }
              }}
            >
              Resource {sortField === 'resource' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => {
                if (sortField === 'action') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortField('action')
                  setSortOrder('asc')
                }
              }}
            >
              Action {sortField === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Roles</TableHead>
            <TableHead className="text-center">Overrides</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPermissions.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {permission.is_system && (
                    <Shield className="h-4 w-4 text-blue-500" title="System Permission" />
                  )}
                  {permission.resource}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getActionColor(permission.action)}>
                  {permission.action}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {permission.name.ko}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {permission.name.en}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                {permission.code}
              </TableCell>
              <TableCell>
                <Badge className={getScopeBadge(permission.scope)}>
                  {permission.scope}
                </Badge>
              </TableCell>
              <TableCell>
                {permission.category ? (
                  <Badge variant="outline">{permission.category}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{permission.role_count}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{permission.user_override_count}</span>
                </div>
              </TableCell>
              <TableCell>
                {permission.is_active ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(permission)}
                    title="Edit Permission"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!permission.is_system && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(permission.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete Permission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
