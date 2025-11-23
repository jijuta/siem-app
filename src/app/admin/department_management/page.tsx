'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Building2, Users, Pencil, Trash2, Network, GitBranch } from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: number
  code: string
  name: { ko: string; en: string; ja: string; zh: string }
}

interface Department {
  id: number
  company_id: number
  parent_id: number | null
  code: string
  name: { ko: string; en: string; ja: string; zh: string }
  description?: { ko: string; en: string; ja: string; zh: string }
  level: number
  path: string
  company_name: { ko: string; en: string; ja: string; zh: string }
  company_code: string
  parent_name?: { ko: string; en: string; ja: string; zh: string }
  user_count: number
  is_active: boolean
  created_at: string
}

interface DepartmentFormData {
  company_id: string
  parent_id: string
  code: string
  name: { ko: string; en: string; ja: string; zh: string }
  description: { ko: string; en: string; ja: string; zh: string }
}

export default function DepartmentManagementPage() {
  const { t, i18n } = useTranslation('departmentManagement')
  const [departments, setDepartments] = useState<Department[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [availableParents, setAvailableParents] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all')

  const [formData, setFormData] = useState<DepartmentFormData>({
    company_id: '',
    parent_id: '',
    code: '',
    name: { ko: '', en: '', ja: '', zh: '' },
    description: { ko: '', en: '', ja: '', zh: '' }
  })

  const currentLang = i18n.language as 'ko' | 'en' | 'ja' | 'zh'

  useEffect(() => {
    fetchDepartments()
    fetchCompanies()
  }, [selectedCompanyFilter])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies')
      const data = await res.json()
      if (data.success) {
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCompanyFilter !== 'all') {
        params.append('companyId', selectedCompanyFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/admin/departments?${params}`)
      const data = await res.json()
      if (data.success) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableParents = async (companyId: string, excludeId?: number) => {
    try {
      const res = await fetch(`/api/admin/departments?companyId=${companyId}`)
      const data = await res.json()
      if (data.success) {
        let parents = data.departments
        if (excludeId) {
          // Exclude current department and its children
          parents = parents.filter((d: Department) =>
            d.id !== excludeId && !d.path.includes(`/${excludeId}/`)
          )
        }
        setAvailableParents(parents)
      }
    } catch (error) {
      console.error('Failed to fetch parent departments:', error)
    }
  }

  const handleSearch = () => {
    fetchDepartments()
  }

  const handleCreate = () => {
    setEditingDepartment(null)
    setFormData({
      company_id: '',
      parent_id: '',
      code: '',
      name: { ko: '', en: '', ja: '', zh: '' },
      description: { ko: '', en: '', ja: '', zh: '' }
    })
    setAvailableParents([])
    setIsDialogOpen(true)
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      company_id: department.company_id.toString(),
      parent_id: department.parent_id?.toString() || '',
      code: department.code,
      name: department.name,
      description: department.description || { ko: '', en: '', ja: '', zh: '' }
    })
    fetchAvailableParents(department.company_id.toString(), department.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department)
    setIsDeleteDialogOpen(true)
  }

  const handleAddChild = (department: Department) => {
    setEditingDepartment(null)
    setFormData({
      company_id: department.company_id.toString(),
      parent_id: department.id.toString(),
      code: '',
      name: { ko: '', en: '', ja: '', zh: '' },
      description: { ko: '', en: '', ja: '', zh: '' }
    })
    fetchAvailableParents(department.company_id.toString())
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validation (code is auto-generated by DB)
    if (!formData.company_id || !formData.name.ko || !formData.name.en || !formData.name.ja || !formData.name.zh) {
      toast.error(t('nameRequired'))
      return
    }

    try {
      const url = editingDepartment
        ? `/api/admin/departments/${editingDepartment.id}`
        : '/api/admin/departments'

      const method = editingDepartment ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: parseInt(formData.company_id),
          parent_id: formData.parent_id && formData.parent_id !== 'none' ? parseInt(formData.parent_id) : null,
          name: formData.name,
          description: formData.description
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editingDepartment ? t('departmentUpdated') : t('departmentCreated'))
        setIsDialogOpen(false)
        fetchDepartments()
      } else {
        toast.error(data.error || t('error'))
      }
    } catch (error) {
      console.error('Failed to save department:', error)
      toast.error(t('error'))
    }
  }

  const confirmDelete = async () => {
    if (!deletingDepartment) return

    try {
      const res = await fetch(`/api/admin/departments/${deletingDepartment.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success(t('departmentDeleted'))
        setIsDeleteDialogOpen(false)
        fetchDepartments()
      } else {
        toast.error(data.error || t('error'))
      }
    } catch (error) {
      console.error('Failed to delete department:', error)
      toast.error(t('error'))
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setFormData({ ...formData, company_id: companyId, parent_id: '' })
    if (companyId) {
      fetchAvailableParents(companyId, editingDepartment?.id)
    } else {
      setAvailableParents([])
    }
  }

  const totalDepartments = departments.length
  const activeDepartments = departments.filter(d => d.is_active).length

  const getIndentedName = (dept: Department) => {
    const indent = '　'.repeat(dept.level)
    return `${indent}${dept.name[currentLang]}`
  }

  return (
    <>
      <PageHeader title={t('title')} />

      <div className="w-full px-8 py-6">
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalDepartments')}</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDepartments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activeDepartments')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDepartments}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('company')} - All</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name[currentLang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>{t('search')}</Button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addDepartment')}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('company')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('code')}</TableHead>
                <TableHead>{t('level')}</TableHead>
                <TableHead>{t('userCount')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {t('noDepartments')}
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {department.company_name[currentLang]}
                      </div>
                    </TableCell>
                    <TableCell>{getIndentedName(department)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Level {department.level}</Badge>
                    </TableCell>
                    <TableCell>{department.user_count}</TableCell>
                    <TableCell>
                      <Badge variant={department.is_active ? 'default' : 'secondary'}>
                        {department.is_active ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddChild(department)}
                          title={t('addChildDepartment')}
                        >
                          <GitBranch className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(department)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? t('editDepartment') : t('createDepartment')}
            </DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
              <TabsTrigger value="multilingual">{t('multilingual')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('company')} *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={handleCompanyChange}
                  disabled={!!editingDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCompany')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name[currentLang]} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">{t('parentDepartment')}</Label>
                <Select
                  value={formData.parent_id}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  disabled={!formData.company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectParent')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noParent')}</SelectItem>
                    {availableParents.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {getIndentedName(dept)} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">{t('code')}</Label>
                <Input
                  id="code"
                  value={formData.code || t('autoGenerated')}
                  disabled={true}
                  placeholder={t('autoGeneratedPlaceholder')}
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  {t('codeAutoGeneratedHelp')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="multilingual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-ko">{t('nameKo')} *</Label>
                <Input
                  id="name-ko"
                  value={formData.name.ko}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: { ...formData.name, ko: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-en">{t('nameEn')} *</Label>
                <Input
                  id="name-en"
                  value={formData.name.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: { ...formData.name, en: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-ja">{t('nameJa')} *</Label>
                <Input
                  id="name-ja"
                  value={formData.name.ja}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: { ...formData.name, ja: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-zh">{t('nameZh')} *</Label>
                <Input
                  id="name-zh"
                  value={formData.name.zh}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: { ...formData.name, zh: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc-ko">{t('descriptionKo')}</Label>
                <Textarea
                  id="desc-ko"
                  value={formData.description.ko}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, ko: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc-en">{t('descriptionEn')}</Label>
                <Textarea
                  id="desc-en"
                  value={formData.description.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, en: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc-ja">{t('descriptionJa')}</Label>
                <Textarea
                  id="desc-ja"
                  value={formData.description.ja}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, ja: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc-zh">{t('descriptionZh')}</Label>
                <Textarea
                  id="desc-zh"
                  value={formData.description.zh}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, zh: e.target.value }
                  })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDepartment')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDelete')}
              {deletingDepartment && (
                <div className="mt-2 font-medium">
                  {deletingDepartment.name[currentLang]} ({deletingDepartment.code})
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
