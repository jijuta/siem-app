"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type DateRangeValue = '1d' | '2d' | '3d' | '7d' | '30d'

export interface DateRange {
  value: DateRangeValue
  from: Date
  to: Date
  label: string
}

interface DateRangeContextValue {
  dateRange: DateRange
  setDateRange: (value: DateRangeValue) => void
  setCustomDateRange: (from: Date, to: Date) => void
  refreshTrigger: number
  triggerRefresh: () => void
}

const DateRangeContext = createContext<DateRangeContextValue | undefined>(undefined)

/**
 * 날짜 범위 값을 Date 객체로 변환
 */
function calculateDateRange(value: DateRangeValue): { from: Date; to: Date; label: string } {
  const now = new Date()
  const to = new Date(now)
  const from = new Date(now)

  switch (value) {
    case '1d':
      from.setDate(from.getDate() - 1)
      return { from, to, label: '최근 1일' }
    case '2d':
      from.setDate(from.getDate() - 2)
      return { from, to, label: '최근 2일' }
    case '3d':
      from.setDate(from.getDate() - 3)
      return { from, to, label: '최근 3일' }
    case '7d':
      from.setDate(from.getDate() - 7)
      return { from, to, label: '최근 7일' }
    case '30d':
      from.setDate(from.getDate() - 30)
      return { from, to, label: '최근 30일' }
    default:
      from.setDate(from.getDate() - 1)
      return { from, to, label: '최근 1일' }
  }
}

interface DateRangeProviderProps {
  children: ReactNode
  defaultValue?: DateRangeValue
}

/**
 * 전역 날짜 범위 상태 관리 Provider
 *
 * 모든 페이지에서 동일한 날짜 범위를 사용할 수 있도록 전역 상태 제공
 * PageHeader의 날짜 선택 박스와 연동되어 전체 앱에서 일관된 날짜 필터링 가능
 */
export function DateRangeProvider({ children, defaultValue = '3d' }: DateRangeProviderProps) {
  const [dateRangeValue, setDateRangeValue] = useState<DateRangeValue>(defaultValue)
  const [customFrom, setCustomFrom] = useState<Date | null>(null)
  const [customTo, setCustomTo] = useState<Date | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const setDateRange = useCallback((value: DateRangeValue) => {
    setDateRangeValue(value)
    setCustomFrom(null)
    setCustomTo(null)
    // 날짜 변경 시 자동으로 새로고침 트리거
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const setCustomDateRange = useCallback((from: Date, to: Date) => {
    setCustomFrom(from)
    setCustomTo(to)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // 사용자 지정 날짜가 있으면 우선 사용
  const { from, to, label } = customFrom && customTo
    ? {
        from: customFrom,
        to: customTo,
        label: `${customFrom.toLocaleDateString('ko-KR')} ~ ${customTo.toLocaleDateString('ko-KR')}`,
      }
    : calculateDateRange(dateRangeValue)

  const value: DateRangeContextValue = {
    dateRange: {
      value: dateRangeValue,
      from,
      to,
      label,
    },
    setDateRange,
    setCustomDateRange,
    refreshTrigger,
    triggerRefresh,
  }

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>
}

/**
 * 날짜 범위 Context Hook
 *
 * @example
 * const { dateRange, setDateRange, triggerRefresh } = useDateRange()
 * console.log(dateRange.from, dateRange.to) // Date 객체
 * setDateRange('7d') // 최근 7일로 변경
 * triggerRefresh() // 데이터 재로드 트리거
 */
export function useDateRange() {
  const context = useContext(DateRangeContext)
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider')
  }
  return context
}

/**
 * ISO 8601 포맷으로 날짜 변환 (OpenSearch 쿼리용)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString()
}
