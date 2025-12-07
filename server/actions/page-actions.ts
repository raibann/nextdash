'use server'
import { db } from '@/db/drizzle'
import { page } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, asc, eq, isNull, ne } from 'drizzle-orm'

export type CreatePage = typeof page.$inferInsert
export type UpdatePage = CreatePage & { id: string }
export type Page = typeof page.$inferSelect
export type PageWithChildren = Page & {
  pages?: PageWithChildren[]
}

const createPage = async (body: CreatePage) => {
  try {
    const existed = await db.query.page.findFirst({
      where: eq(page.name, body.name),
    })
    if (existed) {
      return { data: null, error: 'Page name already exists!' }
    }
    const data = await db.insert(page).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const updatePage = async (body: UpdatePage) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    const existed = await db.query.page.findFirst({
      where: and(eq(page.name, body.name), ne(page.id, body.id)),
    })
    if (existed) {
      return { data: null, error: 'Page name already exists!' }
    }
    const data = await db
      .update(page)
      .set({
        name: body.name,
        icon: body.icon,
        url: body.url,
        badge: body.badge,
        groupTitle: body.groupTitle,
        parentId: body.parentId,
        orderIndex: body.orderIndex,
        isActive: body.isActive,
      })
      .where(eq(page.id, body.id))
      .returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deletePage = async (id: string) => {
  try {
    const data = await db.delete(page).where(eq(page.id, id)).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

// Recursive function to build page hierarchy
const buildPageHierarchy = async (
  parentId: string | null = null,
  groupTitle?: string | null
): Promise<PageWithChildren[]> => {
  const pages = await db.query.page.findMany({
    where: parentId
      ? eq(page.parentId, parentId)
      : groupTitle
      ? and(isNull(page.parentId), eq(page.groupTitle, groupTitle))
      : isNull(page.parentId),
    orderBy: [asc(page.orderIndex), asc(page.createdAt)],
  })

  const pagesWithChildren: PageWithChildren[] = await Promise.all(
    pages.map(async (p) => {
      const children = await buildPageHierarchy(p.id, groupTitle)
      return {
        ...p,
        pages: children.length > 0 ? children : undefined,
      }
    })
  )

  return pagesWithChildren
}

const listPageHierarchy = async () => {
  try {
    const data = await buildPageHierarchy()
    return { data, error: null }
  } catch (error) {
    throwClientError(error)
  }
}

const listPages = async (opts?: {
  pageIndex?: number
  pageSize?: number
  search?: string
}) => {
  try {
    const search = opts?.search ?? ''

    // Get all pages with hierarchy (recursive)
    const hierarchyData = await buildPageHierarchy()

    // Apply search filter if provided
    const filterPages = (pages: PageWithChildren[]): PageWithChildren[] => {
      if (!search) return pages

      const searchLower = search.toLowerCase()
      const filtered: PageWithChildren[] = []

      for (const page of pages) {
        const matchesSearch =
          page.name.toLowerCase().includes(searchLower) ||
          page.name.toLowerCase().includes(searchLower)

        const filteredChildren = page.pages
          ? filterPages(page.pages)
          : undefined

        // Include page if it matches or has matching children
        if (
          matchesSearch ||
          (filteredChildren && filteredChildren.length > 0)
        ) {
          filtered.push({
            ...page,
            pages: filteredChildren,
          })
        }
      }

      return filtered
    }

    const data = search ? filterPages(hierarchyData) : hierarchyData

    // Count total pages (flattened)
    const countPages = (pages: PageWithChildren[]): number => {
      return pages.reduce(
        (count, page) => count + 1 + (page.pages ? countPages(page.pages) : 0),
        0
      )
    }

    const total = countPages(data)

    return {
      data,
      rowCount: total,
      error: null,
    }
  } catch (error) {
    return throwError(error)
  }
}

const getUrlSuggestions = async () => {
  try {
    const data = await db.query.page.findMany({
      columns: {
        id: true,
        name: true,
        url: true,
      },
    })
    return { data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

// Build sidebar data from pages (grouped by groupTitle, filtered by isActive)
const buildSidebarData = async () => {
  try {
    // Get all active pages
    const allPages = await db.query.page.findMany({
      where: eq(page.isActive, true),
      orderBy: [asc(page.orderIndex)],
    })

    // Group pages by groupTitle
    const pagesByGroup = new Map<string, PageWithChildren[]>()
    const rootPages: PageWithChildren[] = []

    // First, organize pages by group
    for (const p of allPages) {
      if (!p.parentId) {
        // Root level page
        if (p.groupTitle) {
          if (!pagesByGroup.has(p.groupTitle)) {
            pagesByGroup.set(p.groupTitle, [])
          }
          pagesByGroup.get(p.groupTitle)!.push({
            ...p,
            pages: undefined,
          })
        } else {
          rootPages.push({
            ...p,
            pages: undefined,
          })
        }
      }
    }

    // Build children for each page
    const buildChildren = (parentId: string): PageWithChildren[] => {
      return allPages
        .filter((p) => p.parentId === parentId)
        .map((p) => ({
          ...p,
          pages:
            allPages.some((child) => child.parentId === p.id) &&
            buildChildren(p.id).length > 0
              ? buildChildren(p.id)
              : undefined,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex)
    }

    // Add children to grouped pages
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, pages] of pagesByGroup.entries()) {
      for (let i = 0; i < pages.length; i++) {
        const children = buildChildren(pages[i].id)
        if (children.length > 0) {
          pages[i].pages = children
        }
      }
    }

    // Convert to SidebarData format
    const navGroups = Array.from(pagesByGroup.entries()).map(
      ([groupTitle, pages]) => ({
        title: groupTitle,
        items: pages.map(convertPageToNavItem),
      })
    )

    return { data: { navGroups }, error: null }
  } catch (error) {
    return throwError(error)
  }
}

// Helper to convert Page to NavItem (matches SidebarData structure)
const convertPageToNavItem = (page: PageWithChildren) => {
  // If page has children, it's a NavCollapsible
  if (page.pages && page.pages.length > 0) {
    return {
      title: page.name,
      icon: page.icon, // Icon name string
      badge: page.badge || undefined,
      items: page.pages.map((child) => ({
        title: child.name,
        url: child.url || '',
        icon: child.icon,
        badge: child.badge || undefined,
      })),
    }
  }

  // Otherwise it's a NavLink
  return {
    title: page.name,
    url: page.url || '',
    icon: page.icon,
    badge: page.badge || undefined,
  }
}

export {
  createPage,
  updatePage,
  deletePage,
  listPageHierarchy,
  listPages,
  getUrlSuggestions,
  buildSidebarData,
}
