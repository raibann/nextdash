'use server'
import { db } from '@/db/drizzle'
import { page } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, asc, eq, isNull, ne } from 'drizzle-orm'

export type CreatePage = typeof page.$inferInsert
export type UpdatePage = CreatePage & { id: string }
export type Page = typeof page.$inferSelect

const createPage = async (body: CreatePage) => {
  try {
    const existed = await db.query.page.findFirst({
      where: eq(page.slug, body.slug),
    })
    if (existed) {
      return { data: null, error: 'Page slug already is existed!' }
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
      where: and(eq(page.slug, body.slug), ne(page.id, body.id)),
    })
    if (existed) {
      return { data: null, error: 'Page slug already is existed!' }
    }
    const data = await db
      .update(page)
      .set({
        name: body.name,
        slug: body.slug,
        icon: body.icon,
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

const listPageHierarchy = async () => {
  try {
    const data = await db.query.page.findMany({
      where: isNull(page.parentId),
      orderBy: [asc(page.orderIndex)],
      with: {
        pages: {
          orderBy: [asc(page.orderIndex)],
          with: {
            pages: {
              orderBy: [asc(page.orderIndex)],
            },
          },
        },
      },
    })
    return { data, error: null }
  } catch (error) {
    throwClientError(error)
  }
}

export type PageWithChildren = Page & {
  pages?: PageWithChildren[]
}

const listPages = async (opts?: {
  pageIndex?: number
  pageSize?: number
  search?: string
}) => {
  try {
    const search = opts?.search ?? ''

    // Get all pages with hierarchy
    const hierarchyData = await db.query.page.findMany({
      where: isNull(page.parentId),
      orderBy: [asc(page.orderIndex)],
      with: {
        pages: {
          orderBy: [asc(page.orderIndex)],
          with: {
            pages: {
              orderBy: [asc(page.orderIndex)],
            },
          },
        },
      },
    })

    // Apply search filter if provided
    const filterPages = (pages: PageWithChildren[]): PageWithChildren[] => {
      if (!search) return pages

      const searchLower = search.toLowerCase()
      const filtered: PageWithChildren[] = []

      for (const page of pages) {
        const matchesSearch =
          page.name.toLowerCase().includes(searchLower) ||
          page.slug.toLowerCase().includes(searchLower)

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

export { createPage, updatePage, deletePage, listPageHierarchy, listPages }
