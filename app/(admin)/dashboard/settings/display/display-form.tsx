'use client'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useQuery } from '@tanstack/react-query'
import {
  listPageHierarchy,
  updatePage,
  Page,
} from '@/server/actions/page-actions'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import { Spinner } from '@/components/ui/spinner'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useMemo, useEffect } from 'react'

const displayFormSchema = z.object({
  items: z.array(z.string()),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

type PageWithChildren = Page & {
  pages?: PageWithChildren[]
}

// Flatten pages recursively
const flattenPages = (pages: PageWithChildren[]): Page[] => {
  const result: Page[] = []
  const traverse = (items: PageWithChildren[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.pages && item.pages.length > 0) {
        traverse(item.pages)
      }
    })
  }
  traverse(pages || [])
  return result
}

export function DisplayForm() {
  const { data, isPending } = useQuery({
    queryKey: ['pages-hierarchy'],
    queryFn: listPageHierarchy,
  })

  const allPages = useMemo(() => {
    return data?.data ? flattenPages(data.data) : []
  }, [data])

  const activePageIds = useMemo(() => {
    return allPages.filter((p) => p.isActive).map((p) => p.id)
  }, [allPages])

  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues: {
      items: [],
    },
  })

  // Update form when data changes
  useEffect(() => {
    if (activePageIds.length > 0) {
      form.reset({ items: activePageIds })
    }
  }, [activePageIds, form])

  const onSubmit = async (data: DisplayFormValues) => {
    const updates: Promise<{ data: Page | null; error: string | null }>[] = []

    // Find pages that need to be activated
    const toActivate = data.items.filter((id) => !activePageIds.includes(id))
    // Find pages that need to be deactivated
    const toDeactivate = activePageIds.filter((id) => !data.items.includes(id))

    toActivate.forEach((id) => {
      const page = allPages.find((p) => p.id === id)
      if (page) {
        updates.push(
          updatePage({
            ...page,
            isActive: true,
          })
        )
      }
    })

    toDeactivate.forEach((id) => {
      const page = allPages.find((p) => p.id === id)
      if (page) {
        updates.push(
          updatePage({
            ...page,
            isActive: false,
          })
        )
      }
    })

    try {
      const results = await Promise.all(updates)
      const hasError = results.some((r) => r.error)
      if (hasError) {
        toast.error('Failed to update some display settings')
      } else {
        toast.success('Display settings updated successfully!')
        getQueryClient().invalidateQueries({
          queryKey: ['pages-hierarchy'],
        })
        getQueryClient().invalidateQueries({
          queryKey: ['pages'],
        })
      }
    } catch {
      toast.error('Failed to update display settings')
    }
  }

  if (isPending) {
    return (
      <div className='border rounded-lg p-8 text-center'>
        <Spinner />
      </div>
    )
  }

  if (allPages.length === 0) {
    return (
      <div className='border rounded-lg p-8 text-center text-muted-foreground'>
        No pages found. Create pages to manage display settings.
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
      <FieldGroup>
        <div className='mb-4'>
          <FieldLabel className='text-base'>Sidebar Pages</FieldLabel>
          <p className='text-sm text-muted-foreground mt-1'>
            Select the pages you want to display in the sidebar.
          </p>
        </div>
        <Controller
          name='items'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className='space-y-2 max-h-[400px] overflow-y-auto'>
                {allPages.map((page) => (
                  <div
                    key={page.id}
                    className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3'
                  >
                    <Checkbox
                      checked={field.value?.includes(page.id)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...field.value, page.id])
                          : field.onChange(
                              field.value?.filter((value) => value !== page.id)
                            )
                      }}
                    />
                    <div className='flex items-center space-x-2 flex-1'>
                      {page.icon && (
                        <DynamicIcon
                          name={page.icon as IconName}
                          className='h-4 w-4'
                        />
                      )}
                      <label className='font-normal cursor-pointer flex-1 text-sm'>
                        {page.name}
                      </label>
                      <span className='text-xs text-muted-foreground'>
                        {page.slug}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type='submit' disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <>
            <Spinner />
            Updating...
          </>
        ) : (
          'Update display'
        )}
      </Button>
    </form>
  )
}
