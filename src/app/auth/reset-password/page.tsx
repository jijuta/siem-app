"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const t = {
    ko: {
      titleRequest: '비밀번호 찾기',
      titleReset: '비밀번호 재설정',
      descriptionRequest: '이메일 주소를 입력하세요',
      descriptionReset: '새 비밀번호를 입력하세요',
      email: '이메일',
      newPassword: '새 비밀번호',
      confirmPassword: '비밀번호 확인',
      sendLink: '재설정 링크 보내기',
      resetPassword: '비밀번호 재설정',
      backToLogin: '로그인으로 돌아가기',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      resetSuccess: '비밀번호가 재설정되었습니다',
      linkSent: '재설정 링크가 이메일로 전송되었습니다',
      invalidToken: '유효하지 않거나 만료된 토큰입니다',
      error: '오류가 발생했습니다'
    },
    en: {
      titleRequest: 'Forgot Password',
      titleReset: 'Reset Password',
      descriptionRequest: 'Enter your email address',
      descriptionReset: 'Enter your new password',
      email: 'Email',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      sendLink: 'Send Reset Link',
      resetPassword: 'Reset Password',
      backToLogin: 'Back to Login',
      passwordMismatch: 'Passwords do not match',
      resetSuccess: 'Password has been reset',
      linkSent: 'Reset link has been sent to your email',
      invalidToken: 'Invalid or expired token',
      error: 'An error occurred'
    },
    ja: {
      titleRequest: 'パスワードを忘れた',
      titleReset: 'パスワードをリセット',
      descriptionRequest: 'メールアドレスを入力してください',
      descriptionReset: '新しいパスワードを入力してください',
      email: 'メールアドレス',
      newPassword: '新しいパスワード',
      confirmPassword: 'パスワード確認',
      sendLink: 'リセットリンクを送信',
      resetPassword: 'パスワードをリセット',
      backToLogin: 'ログインに戻る',
      passwordMismatch: 'パスワードが一致しません',
      resetSuccess: 'パスワードがリセットされました',
      linkSent: 'リセットリンクがメールに送信されました',
      invalidToken: '無効または期限切れのトークン',
      error: 'エラーが発生しました'
    },
    zh: {
      titleRequest: '忘记密码',
      titleReset: '重置密码',
      descriptionRequest: '输入您的电子邮件地址',
      descriptionReset: '输入您的新密码',
      email: '电子邮件',
      newPassword: '新密码',
      confirmPassword: '确认密码',
      sendLink: '发送重置链接',
      resetPassword: '重置密码',
      backToLogin: '返回登录',
      passwordMismatch: '密码不匹配',
      resetSuccess: '密码已重置',
      linkSent: '重置链接已发送到您的电子邮件',
      invalidToken: '无效或过期的令牌',
      error: '发生错误'
    }
  }

  const lang = (i18n.language || 'ko') as keyof typeof t
  const tr = t[lang] || t.ko

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tr.error)
        return
      }

      setSuccess(tr.linkSent)

      // In development, show token in alert
      if (process.env.NODE_ENV === 'development' && data.token) {
        setTimeout(() => {
          alert(`Development mode - Token: ${data.token}\nUse: /auth/reset-password?token=${data.token}`)
        }, 500)
      }
    } catch (error) {
      setError(tr.error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError(tr.passwordMismatch)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tr.error)
        return
      }

      setSuccess(tr.resetSuccess)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error) {
      setError(tr.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {token ? tr.titleReset : tr.titleRequest}
          </CardTitle>
          <CardDescription className="text-center">
            {token ? tr.descriptionReset : tr.descriptionRequest}
          </CardDescription>
        </CardHeader>

        {!token ? (
          <form onSubmit={handleRequestReset}>
            <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="email">{tr.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tr.sendLink}
              </Button>
              <Link href="/auth/login" className="text-sm text-center text-primary hover:underline">
                {tr.backToLogin}
              </Link>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="newPassword">{tr.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{tr.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tr.resetPassword}
              </Button>
              <Link href="/auth/login" className="text-sm text-center text-primary hover:underline">
                {tr.backToLogin}
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
