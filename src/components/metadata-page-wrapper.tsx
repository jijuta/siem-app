"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/page-header'
import { RefreshCw } from 'lucide-react'

interface MetadataPageWrapperProps {
  children?: React.ReactNode
}

export function MetadataPageWrapper({ children }: MetadataPageWrapperProps) {
  const pathname = usePathname()
  const { i18n } = useTranslation()
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const lang = i18n.language || 'ko'
        const res = await fetch(`/api/menu/metadata?path=${pathname}&lang=${lang}`)
        const data = await res.json()

        if (data.success) {
          setMetadata(data.data.localized)
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [pathname, i18n.language])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <PageHeader title={metadata?.title || 'Page'} />
      <div className="w-full px-4 md:px-8 py-6">
        {metadata?.description && (
          <p className="text-muted-foreground mb-6">
            {metadata.description}
          </p>
        )}
        <div className="flex items-center justify-center min-h-[400px]">
          <h3 className="text-2xl font-bold">{metadata?.title || 'Page'} Page</h3>
        </div>
        {children}
      </div>
    </>
  )
}
