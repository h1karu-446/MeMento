'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { ListState } from '@/lib/lists/query'

export function useListNavigation(state: ListState) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState(state.q)
  const [syncedQuery, setSyncedQuery] = useState(state.q)
  // Sync back/forward navigation without remounting the input or losing focus.
  // Preserve newer text if an older, debounced request completes while typing.
  if (syncedQuery !== state.q) {
    setSyncedQuery(state.q)
    if (searchQuery === syncedQuery) setSearchQuery(state.q)
  }
  const [isPending, startTransition] = useTransition()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function navigate(changes: Partial<ListState>, replace = false) {
    if (timer.current) clearTimeout(timer.current)
    const next = { ...state, q: searchQuery, ...changes }
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.filter !== 'すべて') params.set('filter', next.filter)
    if (next.sort !== '新しい順') params.set('sort', next.sort)
    if (next.page > 1) params.set('page', String(next.page))
    const url = `${pathname}${params.size ? `?${params}` : ''}`
    startTransition(() => replace ? router.replace(url, { scroll: false }) : router.push(url, { scroll: false }))
  }
  return {
    searchQuery, isPending,
    setSearchQuery(value: string) {
      setSearchQuery(value)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => navigate({ q: value, page: 1 }, true), 300)
    },
    activeFilter: state.filter, activeSort: state.sort, page: state.page, totalPages: state.totalPages,
    setActiveFilter: (filter: string) => navigate({ filter, page: 1 }),
    setActiveSort: (sort: string) => navigate({ sort, page: 1 }),
    setPage: (page: number | ((current: number) => number)) => navigate({ page: typeof page === 'function' ? page(state.page) : page }),
  }
}
