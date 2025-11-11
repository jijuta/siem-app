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
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { dateRange, setDateRange, triggerRefresh } = useDateRange()

  // Date range labels based on current language
  const dateRangeLabels = {
    '1d': i18n.language === 'ko' ? '최근 1일' : i18n.language === 'ja' ? '最近1日' : i18n.language === 'zh' ? '最近1天' : 'Last 1 day',
    '2d': i18n.language === 'ko' ? '최근 2일' : i18n.language === 'ja' ? '最近2日' : i18n.language === 'zh' ? '最近2天' : 'Last 2 days',
    '3d': i18n.language === 'ko' ? '최근 3일' : i18n.language === 'ja' ? '最近3日' : i18n.language === 'zh' ? '最近3天' : 'Last 3 days',
    '7d': i18n.language === 'ko' ? '최근 7일' : i18n.language === 'ja' ? '最近7日' : i18n.language === 'zh' ? '最近7天' : 'Last 7 days',
    '30d': i18n.language === 'ko' ? '최근 30일' : i18n.language === 'ja' ? '最近30日' : i18n.language === 'zh' ? '最近30天' : 'Last 30 days',
  }

  const dateRangeLabelsShort = {
    '1d': i18n.language === 'ko' ? '1일' : i18n.language === 'ja' ? '1日' : i18n.language === 'zh' ? '1天' : '1d',
    '2d': i18n.language === 'ko' ? '2일' : i18n.language === 'ja' ? '2日' : i18n.language === 'zh' ? '2天' : '2d',
    '3d': i18n.language === 'ko' ? '3일' : i18n.language === 'ja' ? '3日' : i18n.language === 'zh' ? '3天' : '3d',
    '7d': i18n.language === 'ko' ? '7일' : i18n.language === 'ja' ? '7日' : i18n.language === 'zh' ? '7天' : '7d',
    '30d': i18n.language === 'ko' ? '30일' : i18n.language === 'ja' ? '30日' : i18n.language === 'zh' ? '30天' : '30d',
  }

  const refreshLabel = i18n.language === 'ko' ? '데이터 새로고침' : i18n.language === 'ja' ? 'データを更新' : i18n.language === 'zh' ? '刷新数据' : 'Refresh data'
  const refreshTextLabel = i18n.language === 'ko' ? '새로고침' : i18n.language === 'ja' ? '更新' : i18n.language === 'zh' ? '刷新' : 'Refresh'
  const filterLabel = i18n.language === 'ko' ? '필터' : i18n.language === 'ja' ? 'フィルタ' : i18n.language === 'zh' ? '过滤' : 'Filter'
  const downloadLabel = i18n.language === 'ko' ? '다운로드' : i18n.language === 'ja' ? 'ダウンロード' : i18n.language === 'zh' ? '下载' : 'Download'

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
              <SelectItem value="1d">{dateRangeLabels['1d']}</SelectItem>
              <SelectItem value="2d">{dateRangeLabels['2d']}</SelectItem>
              <SelectItem value="3d">{dateRangeLabels['3d']}</SelectItem>
              <SelectItem value="7d">{dateRangeLabels['7d']}</SelectItem>
              <SelectItem value="30d">{dateRangeLabels['30d']}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={triggerRefresh}
            title={refreshLabel}
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
              <SelectItem value="1d">{dateRangeLabelsShort['1d']}</SelectItem>
              <SelectItem value="2d">{dateRangeLabelsShort['2d']}</SelectItem>
              <SelectItem value="3d">{dateRangeLabelsShort['3d']}</SelectItem>
              <SelectItem value="7d">{dateRangeLabelsShort['7d']}</SelectItem>
              <SelectItem value="30d">{dateRangeLabelsShort['30d']}</SelectItem>
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
                {refreshTextLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Filter className="h-4 w-4 mr-2" />
                {filterLabel}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                {downloadLabel}
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