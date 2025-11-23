"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/page-header'
import { Loader2, User, Mail, Phone, Building, Shield } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phone: '',
    department: '',
    role: ''
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const t = {
    ko: {
      title: '프로필',
      description: '계정 정보를 관리하세요',
      personalInfo: '개인 정보',
      securitySettings: '보안 설정',
      email: '이메일',
      name: '이름',
      phone: '전화번호',
      department: '부서',
      role: '권한',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      confirmPassword: '비밀번호 확인',
      save: '저장',
      saveSuccess: '프로필이 업데이트되었습니다',
      saveError: '업데이트 중 오류가 발생했습니다',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      passwordUpdateSuccess: '비밀번호가 변경되었습니다',
      roles: {
        admin: '관리자',
        manager: '매니저',
        analyst: '분석가',
        viewer: '뷰어'
      }
    },
    en: {
      title: 'Profile',
      description: 'Manage your account information',
      personalInfo: 'Personal Information',
      securitySettings: 'Security Settings',
      email: 'Email',
      name: 'Name',
      phone: 'Phone',
      department: 'Department',
      role: 'Role',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      save: 'Save',
      saveSuccess: 'Profile updated successfully',
      saveError: 'Error occurred during update',
      passwordMismatch: 'Passwords do not match',
      passwordUpdateSuccess: 'Password changed successfully',
      roles: {
        admin: 'Admin',
        manager: 'Manager',
        analyst: 'Analyst',
        viewer: 'Viewer'
      }
    },
    ja: {
      title: 'プロフィール',
      description: 'アカウント情報を管理',
      personalInfo: '個人情報',
      securitySettings: 'セキュリティ設定',
      email: 'メールアドレス',
      name: '名前',
      phone: '電話番号',
      department: '部署',
      role: '権限',
      currentPassword: '現在のパスワード',
      newPassword: '新しいパスワード',
      confirmPassword: 'パスワード確認',
      save: '保存',
      saveSuccess: 'プロフィールを更新しました',
      saveError: '更新中にエラーが発生しました',
      passwordMismatch: 'パスワードが一致しません',
      passwordUpdateSuccess: 'パスワードを変更しました',
      roles: {
        admin: '管理者',
        manager: 'マネージャー',
        analyst: 'アナリスト',
        viewer: 'ビューアー'
      }
    },
    zh: {
      title: '个人资料',
      description: '管理您的账户信息',
      personalInfo: '个人信息',
      securitySettings: '安全设置',
      email: '电子邮件',
      name: '姓名',
      phone: '电话',
      department: '部门',
      role: '角色',
      currentPassword: '当前密码',
      newPassword: '新密码',
      confirmPassword: '确认密码',
      save: '保存',
      saveSuccess: '个人资料已更新',
      saveError: '更新时发生错误',
      passwordMismatch: '密码不匹配',
      passwordUpdateSuccess: '密码已更改',
      roles: {
        admin: '管理员',
        manager: '经理',
        analyst: '分析师',
        viewer: '查看者'
      }
    }
  }

  const lang = (i18n.language || 'ko') as keyof typeof t
  const tr = t[lang] || t.ko

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/profile')
        const data = await response.json()

        if (data.success) {
          setProfile({
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone || '',
            department: data.user.department || '',
            role: data.user.role
          })
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status])

  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          department: profile.department
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tr.saveError)
        return
      }

      setSuccess(tr.saveSuccess)
    } catch (error) {
      setError(tr.saveError)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(tr.passwordMismatch)
      return
    }

    if (!passwords.newPassword) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tr.saveError)
        return
      }

      setSuccess(tr.passwordUpdateSuccess)
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setError(tr.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <PageHeader title={tr.title} />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={tr.title} />
      <div className="w-full px-4 md:px-8 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {tr.personalInfo}
            </CardTitle>
            <CardDescription>{tr.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {tr.email}
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {tr.role}
                </Label>
                <Input
                  id="role"
                  value={tr.roles[profile.role as keyof typeof tr.roles] || profile.role}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{tr.name}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {tr.phone}
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {tr.department}
                </Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tr.save}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {tr.securitySettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{tr.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{tr.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{tr.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={saving || !passwords.currentPassword || !passwords.newPassword}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tr.save}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
