'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, Building2, Users, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react'

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
  company_name?: { ko: string; en: string; ja: string; zh: string }
  company_code?: string
  department_name?: { ko: string; en: string; ja: string; zh: string }
  department_code?: string
  created_at: string
  last_login_at: string | null
}

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onEdit?: (user: User) => void
}

export function UserProfileModal({
  open,
  onOpenChange,
  user,
  onEdit,
}: UserProfileModalProps) {
  const { t, i18n } = useTranslation('userManagement')
  const currentLang = i18n.language as 'ko' | 'en' | 'ja' | 'zh'

  if (!user) return null

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자 (Admin)'
      case 'editor':
        return '편집자 (Editor)'
      case 'viewer':
        return '조회자 (Viewer)'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'editor':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>사용자 프로필</DialogTitle>
          <DialogDescription>사용자의 상세 정보를 확인합니다</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleLabel(user.role)}
                </Badge>
                {user.is_active ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    활성
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    비활성
                  </Badge>
                )}
                {user.email_verified && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    <Mail className="h-3 w-3 mr-1" />
                    인증됨
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">연락처 정보</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Organization Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">조직 정보</h4>
            <div className="space-y-2">
              {user.company_name && user.company_code && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.company_name[currentLang]}</span>
                    <span className="text-xs text-muted-foreground">{user.company_code}</span>
                  </div>
                </div>
              )}
              {user.department_name && user.department_code && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.department_name[currentLang]}</span>
                    <span className="text-xs text-muted-foreground">{user.department_code}</span>
                  </div>
                </div>
              )}
              {!user.company_name && !user.department_name && (
                <p className="text-sm text-muted-foreground">조직 정보가 없습니다</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Activity Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">활동 정보</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">가입일</span>
                  <span className="text-sm">{formatDate(user.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">최근 로그인</span>
                  <span className="text-sm">{formatDate(user.last_login_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {onEdit && (
            <Button variant="outline" onClick={() => {
              onEdit(user)
              onOpenChange(false)
            }}>
              수정
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
