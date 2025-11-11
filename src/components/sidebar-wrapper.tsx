"use client"

/**
 * Client Component wrapper for AppSidebar
 * Fetches menu data from API with current language
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppSidebar } from './app-sidebar'
import { navigation as staticNavigation } from '@/lib/navigation'

export function SidebarWrapper() {
  const { i18n } = useTranslation()
  const [navigationData, setNavigationData] = useState(staticNavigation)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setIsLoading(true)
        const currentLang = i18n.language || 'ko'
        const response = await fetch(`/api/menu/navigation?lang=${currentLang}`)
        const result = await response.json()

        if (result.success && result.data) {
          setNavigationData(result.data)
        }
      } catch (error) {
        console.error('Error loading navigation:', error)
        // Keep static navigation as fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchNavigation()
  }, [i18n.language]) // Refetch when language changes

  return <AppSidebar navigationData={navigationData} />
}
