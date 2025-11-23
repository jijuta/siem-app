"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTranslation } from 'react-i18next'
import { useTheme } from "next-themes"
import {
  Bell,
  SunMoon,
  Languages,
} from "lucide-react"

interface PageHeaderProps {
  title?: string
  children?: React.ReactNode
}

export function PageHeader({ title = "인시던트 현황", children }: PageHeaderProps) {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <div className="sticky top-0 z-[100] h-[57px] border-b bg-background backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center gap-2 md:gap-4 px-4 md:px-8 w-full">
        <SidebarTrigger />
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
        </div>
      {children ? children : (
      <>
        {/* Desktop: 언어, 다크모드, 알림 */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('ko')
                window.location.reload()
              }}>
                한국어
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('en')
                window.location.reload()
              }}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('ja')
                window.location.reload()
              }}>
                日本語
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('zh')
                window.location.reload()
              }}>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunMoon className="h-4 w-4" />
          </Button>

          {/* Notification */}
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile: 언어, 다크모드, 알림 */}
        <div className="flex md:hidden items-center gap-1">
          {/* Language Selector - Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Languages className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('ko')
                window.location.reload()
              }}>
                한국어
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('en')
                window.location.reload()
              }}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('ja')
                window.location.reload()
              }}>
                日本語
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await i18n.changeLanguage('zh')
                window.location.reload()
              }}>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle - Mobile */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunMoon className="h-3.5 w-3.5" />
          </Button>

          {/* Notification - Mobile */}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Bell className="h-3.5 w-3.5" />
          </Button>
        </div>
      </>
      )}
      </div>
    </div>
  )
}