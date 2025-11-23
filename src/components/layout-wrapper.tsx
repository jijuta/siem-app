"use client"

import { usePathname } from 'next/navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <main className="w-full flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </main>
  )
}
