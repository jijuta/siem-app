"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Shield,
  Network,
  Lock,
  Brain,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronRight,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Users,
  Globe,
  Database,
  Cloud,
  Cpu,
  Layers,
  Search,
  Pin,
  PinOff,
  TrendingUp,
  Store,
  Workflow,
  GitBranch,
  Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navigation as defaultNavigation } from "@/lib/navigation"
import { hydrateNavigationIcons } from "@/lib/icon-mapper"
import { useSession, signOut } from 'next-auth/react'
import { User as UserIcon, ChevronUp } from 'lucide-react'

// Props interface for AppSidebar
interface AppSidebarProps {
  navigationData?: typeof defaultNavigation
}

// Memoized menu item component for better performance
const SidebarNavItem = React.memo(({
  item,
  pathname,
  state,
  disabled = false
}: {
  item: any,
  pathname: string,
  state: string,
  disabled?: boolean
}) => {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const displayTitle = item.title || item.name // Support both title and name fields
  const Icon = item.icon

  if (state === "collapsed") {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            disabled={disabled}
          >
            <Link href={disabled ? "#" : item.href}>
              <Icon className="h-4 w-4" />
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{displayTitle}</p>
          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
          {item.badge && <p className="text-xs">{item.badge}</p>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      disabled={disabled}
    >
      <Link href={disabled ? "#" : item.href}>
        <Icon className="h-4 w-4" />
        <span>{displayTitle}</span>
        {item.badge && (
          <Badge variant={item.badgeVariant} className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    </SidebarMenuButton>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.item.href === nextProps.item.href &&
    prevProps.pathname === nextProps.pathname &&
    prevProps.state === nextProps.state &&
    prevProps.disabled === nextProps.disabled
  )
})

SidebarNavItem.displayName = 'SidebarNavItem'

// User Menu Component
function UserMenu({ state }: { state: string }) {
  const { data: session } = useSession()
  const { t } = useTranslation()

  const userName = session?.user?.name || t('userMenu.guest')
  const userEmail = session?.user?.email || ''
  const userInitials = userName.substring(0, 2).toUpperCase()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-md transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={session?.user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {userEmail}
                    </span>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <UserIcon className="h-4 w-4" />
                {t('userMenu.profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive cursor-pointer">
              <LogOut className="h-4 w-4" />
              {t('userMenu.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// 모든 하드코딩 배열 제거됨 - DB에서 가져온 데이터 사용

export function AppSidebar({ navigationData = defaultNavigation }: AppSidebarProps = {}) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  // Use navigationData prop or fall back to default navigation
  // If navigationData has iconName strings, hydrate them to icon components
  const navigation = React.useMemo(() => {
    // Check if navigation has iconName (from database) instead of icon
    const firstItem = navigationData?.main?.[0]
    if (firstItem && 'iconName' in firstItem) {
      return hydrateNavigationIcons(navigationData)
    }
    return navigationData
  }, [navigationData])
  const [isPinned, setIsPinned] = React.useState(true) // Default to pinned
  const [isHovered, setIsHovered] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false) // Track hydration
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Mark component as mounted to prevent hydration errors
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load pinned state from localStorage on mount
  React.useEffect(() => {
    const savedPinned = localStorage.getItem('sidebar-pinned')
    // If no saved state, use default (true) and save it
    if (savedPinned === null) {
      localStorage.setItem('sidebar-pinned', 'true')
      setIsPinned(true)
    } else {
      setIsPinned(savedPinned === 'true')
    }
    // Don't automatically open - keep it collapsed by default
    // User can click SidebarTrigger to toggle or hover if not pinned
  }, [])

  // Debug navigation data
  React.useEffect(() => {
    console.log('=== Navigation Debug ===')
    console.log('Categories:', navigation?.categories)
    console.log('Categories length:', navigation?.categories?.length)
    console.log('Vendors:', navigation?.vendors?.length)
    console.log('First category:', navigation?.categories?.[0])
  }, [navigation])

  // Get current section
  const getCurrentSection = () => {
    if (pathname === "/" || pathname === "/dashboard") return "dashboard"
    if (pathname.includes("/ai-analysis")) return "ai"
    if (pathname.includes("/reports")) return "reports"
    if (pathname.includes("/incidents")) return "incidents"
    return "dashboard"
  }

  const currentSection = getCurrentSection()

  // Handle hover for desktop with optimized debounce
  const handleMouseEnter = React.useCallback(() => {
    if (!isMobile && !isPinned) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setOpen(true)
    }
  }, [isMobile, isPinned, setOpen])

  const handleMouseLeave = React.useCallback(() => {
    if (!isMobile && !isPinned) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false)
      }, 300) // 300ms delay on close to prevent flicker
    }
  }, [isMobile, isPinned, setOpen])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Handle pin toggle
  const handlePinToggle = () => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    localStorage.setItem('sidebar-pinned', String(newPinned))
    if (newPinned) {
      setOpen(true)
    }
  }

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "h-screen border-r bg-background",
          "transition-[width] duration-200 ease-out",
          "transform-gpu", // GPU acceleration
          state === "expanded" ? "w-64" : "w-[70px]"
        )}
      >
        <SidebarHeader className="h-[57px] border-b">
          <div className="flex items-center justify-between h-full px-2">
            <Link href="/" className={cn(
              "flex items-center gap-3",
              isMounted && state === "collapsed" && "justify-center w-full"
            )}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shrink-0">
                <span className="text-sm font-bold">DX</span>
              </div>
              {isMounted && state === "expanded" && (
                <span className="text-base font-semibold whitespace-nowrap">DeFender X</span>
              )}
            </Link>
            {isMounted && state === "expanded" && !isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mr-2"
                onClick={handlePinToggle}
              >
                {isPinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto scrollbar-thin">
          {/* 카테고리별 메뉴 렌더링 (DB 기반) */}
          {navigation.categories && navigation.categories.map((category: any, index: number) => (
            <React.Fragment key={category.id || category.name}>
              <SidebarGroup>
                {isMounted && state === "expanded" && (
                  <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items && category.items.map((item: any) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarNavItem
                          item={{...item, title: item.name}}
                          pathname={pathname}
                          state={state}
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {index < navigation.categories.length - 1 && <Separator />}
            </React.Fragment>
          ))}

          {/* 벤더 대시보드 (기존 유지) */}
          {navigation.vendors && navigation.vendors.length > 0 && (
            <>
              <Separator />
              <SidebarGroup>
                {state === "expanded" && (
                  <SidebarGroupLabel>벤더 대시보드</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.vendors.map((vendor: any) => (
                      <SidebarMenuItem key={vendor.href}>
                        <SidebarNavItem
                          item={{...vendor, title: vendor.name}}
                          pathname={pathname}
                          state={state}
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}

        </SidebarContent>

        <SidebarFooter className="border-t">
          <UserMenu state={state} />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}