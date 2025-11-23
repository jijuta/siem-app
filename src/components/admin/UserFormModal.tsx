'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Label } from '@/components/ui/label'
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
  level: number
}

interface User {
  id: number
  email: string
  name: string
  role: string
  department: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  email_verified: boolean
  company_id: number | null
  department_id: number | null
  created_at: string
  last_login_at: string | null
}

interface UserFormData {
  email: string
  name: string
  password: string
  role: string
  phone: string
  company_id: string
  department_id: string
}

interface UserFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  companyId?: number | null
  departmentId?: number | null
  onSuccess?: () => void
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  companyId,
  departmentId,
  onSuccess,
}: UserFormModalProps) {
  const { t, i18n } = useTranslation('userManagement')
  const currentLang = i18n.language as 'ko' | 'en' | 'ja' | 'zh'

  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: 'viewer',
    phone: '',
    company_id: companyId?.toString() || '',
    department_id: departmentId?.toString() || '',
  })

  // Reset form when modal opens or props change
  useEffect(() => {
    if (open) {
      if (user) {
        // Edit mode
        setFormData({
          email: user.email,
          name: user.name,
          password: '', // Don't show password
          role: user.role,
          phone: user.phone || '',
          company_id: user.company_id?.toString() || companyId?.toString() || '',
          department_id: user.department_id?.toString() || departmentId?.toString() || '',
        })
        if (user.company_id) {
          fetchDepartments(user.company_id.toString())
        }
      } else {
        // Create mode
        setFormData({
          email: '',
          name: '',
          password: '',
          role: 'viewer',
          phone: '',
          company_id: companyId?.toString() || '',
          department_id: departmentId?.toString() || '',
        })
        if (companyId) {
          fetchDepartments(companyId.toString())
        }
      }
    }
  }, [open, user, companyId, departmentId])

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies()
  }, [])

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

  const fetchDepartments = async (companyId: string) => {
    try {
      const res = await fetch(`/api/admin/departments?companyId=${companyId}`)
      const data = await res.json()
      if (data.success) {
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const handleCompanyChange = (companyId: string) => {
    setFormData({ ...formData, company_id: companyId, department_id: '' })
    if (companyId) {
      fetchDepartments(companyId)
    } else {
      setDepartments([])
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.email || !formData.name) {
      toast.error('이메일과 이름은 필수입니다')
      return
    }

    if (!user && !formData.password) {
      toast.error('비밀번호는 필수입니다')
      return
    }

    try {
      setLoading(true)
      const url = user
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users'

      const method = user ? 'PUT' : 'POST'

      const payload: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || null,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
      }

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(user ? '사용자가 수정되었습니다' : '사용자가 생성되었습니다')
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(data.error || '오류가 발생했습니다')
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const getIndentedName = (dept: Department) => {
    const indent = '　'.repeat(dept.level)
    return `${indent}${dept.name[currentLang]}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? '사용자 수정' : '사용자 생성'}
          </DialogTitle>
          <DialogDescription>
            {user ? '사용자 정보를 수정합니다' : '새로운 사용자를 생성합니다'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              disabled={!!user} // Email cannot be changed
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="홍길동"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              비밀번호 {!user && '*'}
              {user && <span className="text-xs text-muted-foreground ml-1">(변경 시에만 입력)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={user ? '변경하지 않으려면 비워두세요' : '비밀번호'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">역할 *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">관리자 (Admin)</SelectItem>
                <SelectItem value="editor">편집자 (Editor)</SelectItem>
                <SelectItem value="viewer">조회자 (Viewer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">회사</Label>
            <Select
              value={formData.company_id}
              onValueChange={handleCompanyChange}
              disabled={!!companyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="회사 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name[currentLang]} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">부서</Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData({ ...formData, department_id: value })}
              disabled={!formData.company_id || !!departmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">선택 안 함</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {getIndentedName(dept)} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
