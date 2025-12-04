'use client'

import { useMemo, useState, useCallback } from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'

/**
 * Next.js 13/14/16 support: This hook is compatible with Next.js App Router and URL state,
 * by requiring the parent to manage URL param parsing, pass in search, and provide a navigate function (e.g., from useRouter()).
 */

type SearchRecord = Record<string, unknown>

export type NavigateFn = (opts: {
  search:
    | true
    | SearchRecord
    | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord)
  replace?: boolean
}) => void

type UseTableUrlStateParams = {
  search: SearchRecord
  navigate: NavigateFn
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

type UseTableUrlStateReturn = {
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  ensurePageInRange: (
    pageCount: number,
    opts?: { resetTo?: 'first' | 'last' }
  ) => void
}

export function useTableUrlState(
  params: UseTableUrlStateParams
): UseTableUrlStateReturn {
  const {
    search,
    navigate,
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  // Only set defaults once per hook instance (Backwards compatible)
  const pageKey = paginationCfg?.pageKey ?? 'page'
  const pageSizeKey = paginationCfg?.pageSizeKey ?? 'pageSize'
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? 'filter'
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // Initial column filters, respects Next.js shallow routing and AppRouter compatibility
  const initialColumnFilters = useMemo<ColumnFiltersState>(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = search[cfg.searchKey]
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        // default to array type
        const value = (deserialize(raw) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(columnFiltersCfg), JSON.stringify(search)])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  // Always derive from search, so the current page reflects the actual URL
  const pagination = useMemo<PaginationState>(() => {
    const rawPage = search[pageKey]
    const rawPageSize = search[pageSizeKey]
    const pageNum =
      typeof rawPage === 'number'
        ? rawPage
        : typeof rawPage === 'string'
          ? parseInt(rawPage, 10) || defaultPage
          : defaultPage
    const pageSizeNum =
      typeof rawPageSize === 'number'
        ? rawPageSize
        : typeof rawPageSize === 'string'
          ? parseInt(rawPageSize, 10) || defaultPageSize
          : defaultPageSize
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    typeof search[pageKey] === 'object'
      ? JSON.stringify(search[pageKey])
      : search[pageKey],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    typeof search[pageSizeKey] === 'object'
      ? JSON.stringify(search[pageSizeKey])
      : search[pageSizeKey],
    pageKey,
    pageSizeKey,
    defaultPage,
    defaultPageSize,
  ])

  // Pagination change handler (compatible with useRouter in Next.js 14/16)
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      const nextPage = next.pageIndex + 1
      const nextPageSize = next.pageSize
      navigate({
        search: (prev) => ({
          ...(prev as SearchRecord),
          [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
          [pageSizeKey]:
            nextPageSize === defaultPageSize ? undefined : nextPageSize,
        }),
      })
    },
    [navigate, pagination, pageKey, pageSizeKey, defaultPage, defaultPageSize]
  )

  // Global filter always driven from URL for Next.js client/app support
  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = search[globalFilterKey]
    return typeof raw === 'string' ? raw : ''
  })

  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater(globalFilter ?? '')
              : updater
          const value = trimGlobal ? next.trim() : next
          setGlobalFilter(value)
          navigate({
            search: (prev) => ({
              ...(prev as SearchRecord),
              [pageKey]: undefined,
              [globalFilterKey]: value ? value : undefined,
            }),
          })
        }
      : undefined

  // Memoize onColumnFiltersChange for referential stability (Next.js caution)
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)

      const patch: Record<string, unknown> = {}

      for (const cfg of columnFiltersCfg) {
        const found = next.find((f) => f.id === cfg.columnId)
        const serialize = cfg.serialize ?? ((v: unknown) => v)
        if (cfg.type === 'string') {
          const value =
            typeof found?.value === 'string' ? (found.value as string) : ''
          patch[cfg.searchKey] =
            value.trim() !== '' ? serialize(value) : undefined
        } else {
          const value = Array.isArray(found?.value)
            ? (found!.value as unknown[])
            : []
          patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
        }
      }

      navigate({
        search: (prev) => ({
          ...(prev as SearchRecord),
          [pageKey]: undefined,
          ...patch,
        }),
      })
    },
    [columnFilters, columnFiltersCfg, pageKey, navigate]
  )

  // Ensures the current page isn't out of range when rowCount/pageCount changes
  const ensurePageInRange = useCallback(
    (
      pageCount: number,
      opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
    ) => {
      const currentPage = search[pageKey]
      const pageNum =
        typeof currentPage === 'number'
          ? currentPage
          : typeof currentPage === 'string'
            ? parseInt(currentPage, 10) || defaultPage
            : defaultPage
      if (pageCount > 0 && pageNum > pageCount) {
        navigate({
          replace: true,
          search: (prev) => ({
            ...(prev as SearchRecord),
            [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
          }),
        })
      }
    },
    [search, pageKey, defaultPage, navigate]
  )

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}
