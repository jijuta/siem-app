"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { i18n } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    ko: {
      title: '회원가입',
      description: 'DeFender X SIEM 계정을 생성하세요',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      name: '이름',
      phone: '전화번호',
      department: '부서',
      signup: '회원가입',
      login: '로그인',
      haveAccount: '이미 계정이 있으신가요?',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      emailExists: '이미 사용 중인 이메일입니다',
      signupError: '회원가입 중 오류가 발생했습니다',
      signupSuccess: '회원가입이 완료되었습니다. 로그인해주세요.',
      optional: '(선택)'
    },
    en: {
      title: 'Sign Up',
      description: 'Create your DeFender X SIEM account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      phone: 'Phone',
      department: 'Department',
      signup: 'Sign up',
      login: 'Login',
      haveAccount: 'Already have an account?',
      passwordMismatch: 'Passwords do not match',
      emailExists: 'Email already exists',
      signupError: 'An error occurred during signup',
      signupSuccess: 'Signup successful. Please login.',
      optional: '(optional)'
    },
    ja: {
      title: '新規登録',
      description: 'DeFender X SIEMアカウントを作成',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      name: '名前',
      phone: '電話番号',
      department: '部署',
      signup: '新規登録',
      login: 'ログイン',
      haveAccount: 'すでにアカウントをお持ちですか？',
      passwordMismatch: 'パスワードが一致しません',
      emailExists: 'メールアドレスは既に使用されています',
      signupError: '登録中にエラーが発生しました',
      signupSuccess: '登録が完了しました。ログインしてください。',
      optional: '(任意)'
    },
    zh: {
      title: '注册',
      description: '创建您的 DeFender X SIEM 账户',
      email: '电子邮件',
      password: '密码',
      confirmPassword: '确认密码',
      name: '姓名',
      phone: '电话',
      department: '部门',
      signup: '注册',
      login: '登录',
      haveAccount: '已有账户？',
      passwordMismatch: '密码不匹配',
      emailExists: '电子邮件已存在',
      signupError: '注册时发生错误',
      signupSuccess: '注册成功。请登录。',
      optional: '(可选)'
    }
  }

  const lang = (i18n.language || 'ko') as keyof typeof t
  const tr = t[lang] || t.ko

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(tr.passwordMismatch)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
          department: formData.department || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(tr.emailExists)
        } else {
          setError(data.error || tr.signupError)
        }
        return
      }

      alert(tr.signupSuccess)
      router.push('/auth/login')
    } catch (error) {
      setError(tr.signupError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{tr.title}</CardTitle>
          <CardDescription className="text-center">
            {tr.description}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{tr.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{tr.name}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{tr.password}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{tr.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{tr.phone} {tr.optional}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">{tr.department} {tr.optional}</Label>
              <Input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
              {tr.signup}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {tr.haveAccount}{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                {tr.login}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
