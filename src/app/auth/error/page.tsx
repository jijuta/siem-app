"use client"

import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const { i18n } = useTranslation()
  const error = searchParams.get('error')

  const t = {
    ko: {
      title: '인증 오류',
      description: '로그인 중 문제가 발생했습니다',
      backToLogin: '로그인으로 돌아가기',
      errors: {
        Configuration: '서버 설정 오류가 발생했습니다',
        AccessDenied: '접근이 거부되었습니다',
        Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다',
        Default: '인증 중 오류가 발생했습니다'
      }
    },
    en: {
      title: 'Authentication Error',
      description: 'A problem occurred during login',
      backToLogin: 'Back to Login',
      errors: {
        Configuration: 'Server configuration error occurred',
        AccessDenied: 'Access denied',
        Verification: 'Authentication token has expired or already been used',
        Default: 'An error occurred during authentication'
      }
    },
    ja: {
      title: '認証エラー',
      description: 'ログイン中に問題が発生しました',
      backToLogin: 'ログインに戻る',
      errors: {
        Configuration: 'サーバー設定エラーが発生しました',
        AccessDenied: 'アクセスが拒否されました',
        Verification: '認証トークンの有効期限が切れているか、既に使用されています',
        Default: '認証中にエラーが発生しました'
      }
    },
    zh: {
      title: '认证错误',
      description: '登录时出现问题',
      backToLogin: '返回登录',
      errors: {
        Configuration: '服务器配置错误',
        AccessDenied: '访问被拒绝',
        Verification: '认证令牌已过期或已被使用',
        Default: '认证时发生错误'
      }
    }
  }

  const lang = (i18n.language || 'ko') as keyof typeof t
  const tr = t[lang] || t.ko

  const getErrorMessage = () => {
    if (!error) return tr.errors.Default
    if (error in tr.errors) {
      return tr.errors[error as keyof typeof tr.errors]
    }
    return tr.errors.Default
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">{tr.title}</CardTitle>
          <CardDescription className="text-center">
            {tr.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">
              {tr.backToLogin}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
