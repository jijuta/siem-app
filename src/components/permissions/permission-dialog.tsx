'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Permission } from './permissions-management'

interface PermissionDialogProps {
  permission: Permission | null
  open: boolean
  onClose: () => void
  onSave: () => void
}

const RESOURCES = ['users', 'companies', 'departments', 'roles', 'menus', 'audit_logs', 'incidents', 'alerts', 'dashboards', 'reports', 'system_settings']
const ACTIONS = ['create', 'read', 'update', 'delete', 'export', 'manage']
const SCOPES = ['ALL', 'COMPANY', 'DEPARTMENT', 'OWN']
const CATEGORIES = ['system_admin', 'security', 'analysis', 'reports']

export default function PermissionDialog({
  permission,
  open,
  onClose,
  onSave,
}: PermissionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [resource, setResource] = useState('')
  const [action, setAction] = useState('')
  const [scope, setScope] = useState('COMPANY')
  const [category, setCategory] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Multi-language names
  const [nameKo, setNameKo] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [nameJa, setNameJa] = useState('')
  const [nameZh, setNameZh] = useState('')

  // Multi-language descriptions
  const [descKo, setDescKo] = useState('')
  const [descEn, setDescEn] = useState('')
  const [descJa, setDescJa] = useState('')
  const [descZh, setDescZh] = useState('')

  // Load permission data for editing
  useEffect(() => {
    if (permission) {
      setResource(permission.resource)
      setAction(permission.action)
      setScope(permission.scope)
      setCategory(permission.category || '')
      setIsActive(permission.is_active)

      setNameKo(permission.name.ko)
      setNameEn(permission.name.en)
      setNameJa(permission.name.ja)
      setNameZh(permission.name.zh)

      if (permission.description) {
        setDescKo(permission.description.ko || '')
        setDescEn(permission.description.en || '')
        setDescJa(permission.description.ja || '')
        setDescZh(permission.description.zh || '')
      }
    } else {
      // Reset for new permission
      setResource('')
      setAction('')
      setScope('COMPANY')
      setCategory('')
      setIsActive(true)
      setNameKo('')
      setNameEn('')
      setNameJa('')
      setNameZh('')
      setDescKo('')
      setDescEn('')
      setDescJa('')
      setDescZh('')
    }
  }, [permission])

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!resource || !action) {
      toast({
        title: 'Validation Error',
        description: 'Resource and Action are required',
        variant: 'destructive',
      })
      return
    }

    if (!nameKo || !nameEn || !nameJa || !nameZh) {
      toast({
        title: 'Validation Error',
        description: 'Name is required in all languages',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const code = `${resource}.${action}`

      const payload = {
        resource,
        action,
        code,
        name: {
          ko: nameKo,
          en: nameEn,
          ja: nameJa,
          zh: nameZh,
        },
        description: descKo || descEn || descJa || descZh ? {
          ko: descKo,
          en: descEn,
          ja: descJa,
          zh: descZh,
        } : null,
        scope,
        category: category || null,
        is_active: isActive,
      }

      const url = permission
        ? `/api/admin/permissions/${permission.id}`
        : '/api/admin/permissions'

      const response = await fetch(url, {
        method: permission ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: permission
            ? 'Permission updated successfully'
            : 'Permission created successfully',
        })
        onSave()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save permission',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Save permission error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save permission',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {permission ? 'Edit Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription>
            {permission
              ? `Edit permission: ${permission.code}`
              : 'Create a new permission for the system'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource">
                Resource <span className="text-red-500">*</span>
              </Label>
              <Select
                value={resource}
                onValueChange={setResource}
                disabled={!!permission} // Cannot change for existing
              >
                <SelectTrigger id="resource">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">
                Action <span className="text-red-500">*</span>
              </Label>
              <Select
                value={action}
                onValueChange={setAction}
                disabled={!!permission} // Cannot change for existing
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permission Code Preview */}
          {resource && action && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Permission Code:</div>
              <div className="font-mono font-bold text-lg">{resource}.{action}</div>
            </div>
          )}

          {/* Multi-language Tabs */}
          <Tabs defaultValue="ko" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ko">한국어</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ja">日本語</TabsTrigger>
              <TabsTrigger value="zh">中文</TabsTrigger>
            </TabsList>

            <TabsContent value="ko" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_ko">
                  Name (Korean) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name_ko"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  placeholder="예: 사용자 생성"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc_ko">Description (Korean)</Label>
                <Textarea
                  id="desc_ko"
                  value={descKo}
                  onChange={(e) => setDescKo(e.target.value)}
                  placeholder="예: 새로운 사용자를 생성할 수 있는 권한"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">
                  Name (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name_en"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g., Create User"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc_en">Description (English)</Label>
                <Textarea
                  id="desc_en"
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="e.g., Permission to create new users"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="ja" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_ja">
                  Name (Japanese) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name_ja"
                  value={nameJa}
                  onChange={(e) => setNameJa(e.target.value)}
                  placeholder="例：ユーザー作成"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc_ja">Description (Japanese)</Label>
                <Textarea
                  id="desc_ja"
                  value={descJa}
                  onChange={(e) => setDescJa(e.target.value)}
                  placeholder="例：新しいユーザーを作成する権限"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="zh" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_zh">
                  Name (Chinese) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name_zh"
                  value={nameZh}
                  onChange={(e) => setNameZh(e.target.value)}
                  placeholder="例：创建用户"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc_zh">Description (Chinese)</Label>
                <Textarea
                  id="desc_zh"
                  value={descZh}
                  onChange={(e) => setDescZh(e.target.value)}
                  placeholder="例：创建新用户的权限"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          {permission?.is_system && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ This is a system permission. Resource and Action cannot be changed.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : permission ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
