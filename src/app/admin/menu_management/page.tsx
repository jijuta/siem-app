"use client"

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus, Edit, Trash2, Eye, EyeOff, RefreshCw,
  GripVertical, ChevronRight, ChevronDown, History, Search
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MenuItem {
  id: number
  category_id: number | null
  parent_id: number | null
  name: string
  label: Record<string, string>
  href: string
  icon: string | null
  order_index: number
  is_active: boolean
  badge: any
  children?: MenuItem[]
}

interface Vendor {
  id: number
  vendor_id: string
  name: string
  label: Record<string, string>
  icon: string | null
  color: string | null
  order_index: number
  is_active: boolean
  pages?: VendorPage[]
}

interface VendorPage {
  id: number
  vendor_id: number
  name: string
  label: Record<string, string>
  href: string
  order_index: number
  is_active: boolean
}

interface MenuCategory {
  id: number
  name: string
  label: Record<string, string>
}

// Sortable Row Component with Tree Support
function SortableRow({ item, onToggle, onEdit, onDelete, onAddChild, depth = 0, expandedItems, onToggleExpand }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.has(item.id)

  return (
    <>
      <TableRow ref={setNodeRef} style={style} className="group hover:bg-muted/50">
        <TableCell>
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical className="h-4 w-4" />
          </div>
        </TableCell>
        <TableCell>{item.order_index}</TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren && (
              <button
                onClick={() => onToggleExpand(item.id)}
                className="hover:bg-muted rounded p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            <span>{item.label?.ko || item.name}</span>
            {depth > 0 && (
              <Badge variant="outline" className="text-xs">
                Child
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {item.href}
        </TableCell>
        <TableCell>{item.icon || '-'}</TableCell>
        <TableCell>
          <Badge variant={item.is_active ? 'default' : 'secondary'}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(item)}
              className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Add child menu"
            >
              <Plus className="h-3 w-3 mr-1" />
              Child
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggle(item)}
            >
              {item.is_active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {hasChildren && isExpanded && item.children.map((child: MenuItem) => (
        <SortableRow
          key={child.id}
          item={child}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          depth={depth + 1}
          expandedItems={expandedItems}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  )
}

export default function MenuManagementPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageDialogOpen, setPageDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [parentMenuItem, setParentMenuItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [permissions, setPermissions] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('admin')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    label_ko: '',
    label_en: '',
    label_ja: '',
    label_zh: '',
    href: '',
    icon: '',
    category_id: '',
    parent_id: '',
    order_index: 0,
  })

  // Vendor form state
  const [vendorFormData, setVendorFormData] = useState({
    vendor_id: '',
    name: '',
    label_ko: '',
    label_en: '',
    icon: '',
    color: '',
    desc_ko: '',
    desc_en: '',
    order_index: 0,
  })

  // Page form state
  const [pageFormData, setPageFormData] = useState({
    name: '',
    label_ko: '',
    label_en: '',
    href: '',
    order_index: 0,
  })

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsRes, vendorsRes, categoriesRes] = await Promise.all([
        fetch('/api/menu/items'),
        fetch('/api/menu/vendors'),
        fetch('/api/menu/categories'),
      ])

      const itemsData = await itemsRes.json()
      const vendorsData = await vendorsRes.json()
      const categoriesData = await categoriesRes.json()

      if (itemsData.success) setMenuItems(itemsData.data)
      if (vendorsData.success) setVendors(vendorsData.data)
      if (categoriesData.success) setCategories(categoriesData.data || [])
    } catch (error) {
      toast.error('Failed to fetch menu data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/menu/audit-logs')
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    }
  }

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/menu/permissions')
      const data = await res.json()
      if (data.success) {
        setPermissions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  // Toggle permission
  const togglePermission = async (menuItemId: number, role: string, currentValue: boolean) => {
    try {
      const res = await fetch('/api/menu/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_item_id: menuItemId,
          role: role,
          can_view: !currentValue
        })
      })

      if (res.ok) {
        toast.success('Permission updated')
        fetchPermissions()
      } else {
        toast.error('Failed to update permission')
      }
    } catch (error) {
      toast.error('Error updating permission')
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter menu items based on search query
  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery.trim()) return menuItems

    const query = searchQuery.toLowerCase()
    return menuItems.filter((item) => {
      const labelMatch = Object.values(item.label).some((label) =>
        label.toLowerCase().includes(query)
      )
      const nameMatch = item.name.toLowerCase().includes(query)
      const hrefMatch = item.href.toLowerCase().includes(query)
      return labelMatch || nameMatch || hrefMatch
    })
  }, [menuItems, searchQuery])

  // Filter vendors based on search query
  const filteredVendors = React.useMemo(() => {
    if (!searchQuery.trim()) return vendors

    const query = searchQuery.toLowerCase()
    return vendors.filter((vendor) => {
      const labelMatch = Object.values(vendor.label).some((label) =>
        label.toLowerCase().includes(query)
      )
      const nameMatch = vendor.name.toLowerCase().includes(query)
      const vendorIdMatch = vendor.vendor_id.toLowerCase().includes(query)
      return labelMatch || nameMatch || vendorIdMatch
    })
  }, [vendors, searchQuery])

  // Open create dialog
  const openCreateDialog = () => {
    setSelectedItem(null)
    setFormData({
      name: '',
      label_ko: '',
      label_en: '',
      label_ja: '',
      label_zh: '',
      href: '',
      icon: '',
      category_id: '',
      parent_id: '',
      order_index: menuItems.length + 1,
    })
    setDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item)
    setParentMenuItem(null)
    setFormData({
      name: item.name,
      label_ko: item.label.ko || '',
      label_en: item.label.en || '',
      label_ja: item.label.ja || '',
      label_zh: item.label.zh || '',
      href: item.href,
      icon: item.icon || '',
      category_id: item.category_id?.toString() || '',
      parent_id: item.parent_id?.toString() || '',
      order_index: item.order_index,
    })
    setDialogOpen(true)
  }

  // Open add child dialog
  const openAddChildDialog = (parentItem: MenuItem) => {
    setSelectedItem(null)
    setParentMenuItem(parentItem)
    setFormData({
      name: '',
      label_ko: '',
      label_en: '',
      label_ja: '',
      label_zh: '',
      href: '',
      icon: '',
      category_id: parentItem.category_id?.toString() || '',
      parent_id: parentItem.id.toString(),
      order_index: (parentItem.children?.length || 0) + 1,
    })
    setDialogOpen(true)
  }

  // Toggle expanded state
  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Save menu item
  const saveMenuItem = async () => {
    try {
      const payload = {
        name: formData.name,
        label: {
          ko: formData.label_ko,
          en: formData.label_en,
          ja: formData.label_ja,
          zh: formData.label_zh,
        },
        href: formData.href,
        icon: formData.icon || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        order_index: formData.order_index,
      }

      const res = selectedItem
        ? await fetch(`/api/menu/items/${selectedItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/menu/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (res.ok) {
        toast.success(selectedItem ? 'Menu item updated' : 'Menu item created')
        setDialogOpen(false)
        fetchData()
        router.refresh() // Refresh sidebar navigation
      } else {
        toast.error('Failed to save menu item')
      }
    } catch (error) {
      toast.error('Error saving menu item')
      console.error(error)
    }
  }

  // Toggle menu item
  const toggleMenuItem = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active }),
      })

      if (res.ok) {
        toast.success(`Menu item ${item.is_active ? 'deactivated' : 'activated'}`)
        fetchData()
        router.refresh() // Refresh sidebar navigation
      } else {
        toast.error('Failed to update menu item')
      }
    } catch (error) {
      toast.error('Error updating menu item')
      console.error(error)
    }
  }

  // Delete menu item
  const deleteMenuItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Menu item deleted')
        fetchData()
        router.refresh() // Refresh sidebar navigation
      } else {
        toast.error('Failed to delete menu item')
      }
    } catch (error) {
      toast.error('Error deleting menu item')
      console.error(error)
    }
  }

  // Toggle vendor
  const toggleVendor = async (vendor: Vendor) => {
    try {
      const res = await fetch(`/api/menu/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !vendor.is_active }),
      })

      if (res.ok) {
        toast.success(`Vendor ${vendor.is_active ? 'deactivated' : 'activated'}`)
        fetchData()
      } else {
        toast.error('Failed to update vendor')
      }
    } catch (error) {
      toast.error('Error updating vendor')
      console.error(error)
    }
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = menuItems.findIndex((item) => item.id === active.id)
    const newIndex = menuItems.findIndex((item) => item.id === over.id)

    const newItems = arrayMove(menuItems, oldIndex, newIndex)
    setMenuItems(newItems)

    // Update order in backend
    try {
      await Promise.all(
        newItems.map((item, index) =>
          fetch(`/api/menu/items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: index + 1 }),
          })
        )
      )
      toast.success('Menu order updated')
    } catch (error) {
      toast.error('Failed to update menu order')
      fetchData() // Revert on error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Menu Management System"
        description="Dynamic sidebar navigation configuration with drag-and-drop, caching, and audit logging"
      />

      <div className="w-full px-8 py-6">
        <Tabs defaultValue="menu-items" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="vendor-pages">Vendor Pages</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="메뉴 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[300px]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  fetchAuditLogs()
                  setAuditDialogOpen(true)
                }}
              >
                <History className="h-4 w-4 mr-2" />
                View Audit Logs
              </Button>
            </div>
          </div>

          <TabsContent value="menu-items">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>
                      Drag to reorder • Click to edit • Toggle visibility
                    </CardDescription>
                  </div>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredMenuItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-8">
                      {/* Group items by category */}
                      {categories
                        .sort((a, b) => {
                          const aItem = menuItems.find(item => item.category_id === a.id)
                          const bItem = menuItems.find(item => item.category_id === b.id)
                          return (aItem?.order_index || 0) - (bItem?.order_index || 0)
                        })
                        .map((category) => {
                          const categoryItems = filteredMenuItems.filter(
                            (item) => item.category_id === category.id && !item.parent_id
                          )

                          if (categoryItems.length === 0) return null

                          return (
                            <div key={category.id} className="space-y-2">
                              {/* Category Header */}
                              <div className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {category.label.ko || category.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.name} • {categoryItems.length} items
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  대메뉴
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(null)
                                    setParentMenuItem(null)
                                    setFormData({
                                      name: '',
                                      label_ko: '',
                                      label_en: '',
                                      label_ja: '',
                                      label_zh: '',
                                      href: '',
                                      icon: '',
                                      category_id: category.id.toString(),
                                      parent_id: '',
                                      order_index: categoryItems.length + 1,
                                    })
                                    setDialogOpen(true)
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  하위 메뉴 추가
                                </Button>
                              </div>

                              {/* Category Items Table */}
                              <div className="w-full overflow-x-auto">
                                <Table className="table-fixed w-full">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]"></TableHead>
                                      <TableHead className="w-[80px]">Order</TableHead>
                                      <TableHead className="w-[250px]">Name</TableHead>
                                      <TableHead className="w-[300px]">Path</TableHead>
                                      <TableHead className="w-[120px]">Icon</TableHead>
                                      <TableHead className="w-[100px]">Status</TableHead>
                                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {categoryItems.map((item) => (
                                      <SortableRow
                                        key={item.id}
                                        item={item}
                                        onToggle={toggleMenuItem}
                                        onEdit={openEditDialog}
                                        onDelete={deleteMenuItem}
                                        onAddChild={openAddChildDialog}
                                        expandedItems={expandedItems}
                                        onToggleExpand={toggleExpanded}
                                      />
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )
                        })}

                      {/* Items without category */}
                      {filteredMenuItems.filter((item) => !item.category_id && !item.parent_id).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 py-3 px-4 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-muted-foreground">
                                Uncategorized Items
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Items without a category
                              </p>
                            </div>
                          </div>

                          <div className="w-full overflow-x-auto">
                            <Table className="table-fixed w-full">
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[50px]"></TableHead>
                                  <TableHead className="w-[80px]">Order</TableHead>
                                  <TableHead className="w-[250px]">Name</TableHead>
                                  <TableHead className="w-[300px]">Path</TableHead>
                                  <TableHead className="w-[120px]">Icon</TableHead>
                                  <TableHead className="w-[100px]">Status</TableHead>
                                  <TableHead className="w-[200px] text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {menuItems
                                  .filter((item) => !item.category_id && !item.parent_id)
                                  .map((item) => (
                                    <SortableRow
                                      key={item.id}
                                      item={item}
                                      onToggle={toggleMenuItem}
                                      onEdit={openEditDialog}
                                      onDelete={deleteMenuItem}
                                      onAddChild={openAddChildDialog}
                                      expandedItems={expandedItems}
                                      onToggleExpand={toggleExpanded}
                                    />
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vendors</CardTitle>
                    <CardDescription>
                      Manage security vendor integrations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>{vendor.order_index}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {vendor.vendor_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {vendor.label.ko || vendor.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: vendor.color || '#gray' }}
                            />
                            <span className="text-sm">{vendor.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {vendor.pages?.length || 0} pages
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={vendor.is_active ? 'default' : 'secondary'}
                          >
                            {vendor.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleVendor(vendor)}
                            >
                              {vendor.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendor-pages">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Pages</CardTitle>
                <CardDescription>
                  Manage sub-pages for each vendor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredVendors.map((vendor) => vendor.is_active && (
                  <div key={vendor.id} className="mb-6">
                    <h3 className="font-semibold mb-2">
                      {vendor.label.ko || vendor.name} ({vendor.pages?.length || 0} pages)
                    </h3>
                    <div className="pl-4 space-y-1">
                      {vendor.pages?.map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted"
                        >
                          <div>
                            <span className="font-medium">{page.label.ko || page.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {page.href}
                            </span>
                          </div>
                          <Badge variant={page.is_active ? 'default' : 'secondary'}>
                            {page.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role-Based Menu Permissions</CardTitle>
                    <CardDescription>
                      Manage which menus each role can access
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={fetchPermissions}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin (Full Access)</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  {permissions.map((roleData) => {
                    const totalMenus = roleData.permissions?.length || 0
                    const accessibleMenus = roleData.permissions?.filter((p: any) => p.can_view).length || 0
                    return (
                      <Card key={roleData.role}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium capitalize">
                            {roleData.role}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{accessibleMenus}/{totalMenus}</div>
                          <p className="text-xs text-muted-foreground">menus accessible</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Permission Matrix */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Menu Item</TableHead>
                        <TableHead className="text-center">Admin</TableHead>
                        <TableHead className="text-center">Manager</TableHead>
                        <TableHead className="text-center">Analyst</TableHead>
                        <TableHead className="text-center">Viewer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => {
                        const categoryItems = menuItems.filter(
                          (item) => item.category_id === category.id && !item.parent_id
                        )

                        if (categoryItems.length === 0) return null

                        return (
                          <React.Fragment key={category.id}>
                            {/* Category Header Row */}
                            <TableRow className="bg-muted/50">
                              <TableCell colSpan={5} className="font-semibold">
                                {category.label.ko || category.name}
                              </TableCell>
                            </TableRow>

                            {/* Menu Items */}
                            {categoryItems.map((item) => {
                              const getPermission = (role: string) => {
                                const roleData = permissions.find((p) => p.role === role)
                                const perm = roleData?.permissions?.find(
                                  (p: any) => p.menu_item_id === item.id
                                )
                                return perm?.can_view || false
                              }

                              return (
                                <TableRow key={item.id}>
                                  <TableCell className="pl-8">
                                    <div className="flex items-center gap-2">
                                      <span>{item.label.ko || item.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({item.href})
                                      </span>
                                    </div>
                                  </TableCell>
                                  {['admin', 'manager', 'analyst', 'viewer'].map((role) => (
                                    <TableCell key={role} className="text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => togglePermission(item.id, role, getPermission(role))}
                                        className={getPermission(role) ? 'text-green-600' : 'text-gray-400'}
                                      >
                                        {getPermission(role) ? (
                                          <Eye className="h-4 w-4" />
                                        ) : (
                                          <EyeOff className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            })}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Menu Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem
                ? 'Edit Menu Item'
                : parentMenuItem
                  ? `Add Child Menu to: ${parentMenuItem.label.ko || parentMenuItem.name}`
                  : 'Create Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {parentMenuItem && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <Badge variant="outline">Parent</Badge>
                  <span className="font-medium">{parentMenuItem.label.ko || parentMenuItem.name}</span>
                  <span className="text-muted-foreground">({parentMenuItem.href})</span>
                </div>
              )}
              <span className="block mt-2">Fill in the details below. All languages are supported.</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Dashboard"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label_ko" className="text-right">
                한국어 *
              </Label>
              <Input
                id="label_ko"
                value={formData.label_ko}
                onChange={(e) =>
                  setFormData({ ...formData, label_ko: e.target.value })
                }
                className="col-span-3"
                placeholder="대시보드"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label_en" className="text-right">
                English *
              </Label>
              <Input
                id="label_en"
                value={formData.label_en}
                onChange={(e) =>
                  setFormData({ ...formData, label_en: e.target.value })
                }
                className="col-span-3"
                placeholder="Dashboard"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="href" className="text-right">
                Path *
              </Label>
              <Input
                id="href"
                value={formData.href}
                onChange={(e) =>
                  setFormData({ ...formData, href: e.target.value })
                }
                className="col-span-3"
                placeholder="/dashboard"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="col-span-3"
                placeholder="LayoutDashboard"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order_index" className="text-right">
                Order
              </Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order_index: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMenuItem}>
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Logs Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
            <DialogDescription>
              Recent changes to menu system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge>{log.action}</Badge>
                    <span className="ml-2 font-medium">{log.table_name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ID: {log.record_id}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.changed_at).toLocaleString()}
                  </span>
                </div>
                {log.changed_by && (
                  <div className="text-sm text-muted-foreground mt-1">
                    By: {log.changed_by}
                  </div>
                )}
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No audit logs available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
