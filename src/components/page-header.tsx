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
  Calendar,
  Filter,
  Download,
  RefreshCcw,
  SunMoon,
  Languages,
  MoreVertical,
} from "lucide-react"
import { useDateRange, type DateRangeValue } from "@/contexts/date-range-context"

interface PageHeaderProps {
  title?: string
  children?: React.ReactNode
}

export function PageHeader({ title = "인시던트 현황", children }: PageHeaderProps) {
  const { i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { dateRange, setDateRange, triggerRefresh } = useDateRange()

  return (
    <div className="sticky top-0 z-[100] h-[57px] border-b bg-background backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center gap-2 md:gap-4 px-4 md:px-8 w-full">
        <SidebarTrigger />
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-lg font-semibold truncate">{title}</h1>
        </div>
      {children ? children : (
      <>
        {/* Desktop: 모든 버튼 표시 */}
        <div className="hidden md:flex items-center gap-2">
          {/* Time Filter - 전역 날짜 범위 선택 */}
          <Select
            value={dateRange.value}
            onValueChange={(value) => setDateRange(value as DateRangeValue)}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">최근 1일</SelectItem>
              <SelectItem value="2d">최근 2일</SelectItem>
              <SelectItem value="3d">최근 3일</SelectItem>
              <SelectItem value="7d">최근 7일</SelectItem>
              <SelectItem value="30d">최근 30일</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={triggerRefresh}
            title="데이터 새로고침"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

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

          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile: 날짜, 언어, 다크모드 + More 버튼 */}
        <div className="flex md:hidden items-center gap-1">
          {/* Date Range - Mobile Compact */}
          <Select
            value={dateRange.value}
            onValueChange={(value) => setDateRange(value as DateRangeValue)}
          >
            <SelectTrigger className="w-[90px] h-9">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1일</SelectItem>
              <SelectItem value="2d">2일</SelectItem>
              <SelectItem value="3d">3일</SelectItem>
              <SelectItem value="7d">7일</SelectItem>
              <SelectItem value="30d">30일</SelectItem>
            </SelectContent>
          </Select>

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

          {/* More Menu - Mobile Only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={triggerRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                새로고침
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Filter className="h-4 w-4 mr-2" />
                필터
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
      )}
      </div>
    </div>
  )
}