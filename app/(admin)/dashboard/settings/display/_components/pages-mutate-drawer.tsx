'use client'

import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { IconName, IconPicker } from '@/components/ui/icon-picker'
import { createPage, Page, updatePage } from '@/server/actions/page-actions'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useQuery } from '@tanstack/react-query'
import { listPageHierarchy } from '@/server/actions/page-actions'
import PagesUrlInputWithSuggestions from './pages-url-suggestion-input'
import { useMemo, useEffect, useRef } from 'react'

type PagesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Page
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  url: z.string().min(1, 'Url is required'),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().min(0),
  isActive: z.boolean(),
})

type FormSchema = z.infer<typeof formSchema>

type PageWithChildren = Page & {
  pages?: PageWithChildren[]
}

// Helper function to recursively render pages with hierarchy
// Recursive hierarchical rendering with indentation and self-parent exclusion
const renderPageHierarchy = (
  pages: PageWithChildren[] = [],
  depth: number = 0,
  excludeId?: string
): React.ReactElement[] => {
  return pages
    .filter((page) => !excludeId || page.id !== excludeId)
    .flatMap((page) => [
      <SelectItem key={page.id} value={page.id}>
        <span style={{ paddingLeft: `${depth * 16}px` }}>
          {depth > 0 ? Array(depth).fill('—').join('') + ' ' : ''}
          {page.name}
        </span>
      </SelectItem>,
      ...(page.pages
        ? renderPageHierarchy(page.pages, depth + 1, excludeId)
        : []),
    ])
}

export function PagesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PagesMutateDrawerProps) {
  // isUpdate is true only if currentRow has a non-empty id
  const isUpdate = !!(currentRow?.id && currentRow.id.trim() !== '')

  // Create a key that changes when currentRow changes to force form remount
  const formKey = useMemo(
    () => `form-${currentRow?.id || 'new'}-${currentRow?.parentId || 'none'}`,
    [currentRow?.id, currentRow?.parentId]
  )

  // Memoize default values to prevent unnecessary re-initializations
  const defaultValues = useMemo<FormSchema>(
    () => ({
      id: currentRow?.id,
      name: currentRow?.name ?? '',
      url: currentRow?.url ?? '',
      icon: currentRow?.icon ?? 'layout',
      parentId: currentRow?.parentId ?? undefined,
      orderIndex: currentRow?.orderIndex ?? 0,
      isActive: currentRow?.isActive ?? true,
    }),
    [
      currentRow?.id,
      currentRow?.name,
      currentRow?.url,
      currentRow?.icon,
      currentRow?.parentId,
      currentRow?.orderIndex,
      currentRow?.isActive,
    ]
  )

  const form = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const { data: pagesData } = useQuery({
    queryKey: ['pages-hierarchy'],
    queryFn: listPageHierarchy,
    enabled: open,
  })

  // Track the last form key to avoid unnecessary resets
  const lastFormKeyRef = useRef<string>(formKey)
  const wasOpenRef = useRef(open)

  // Reset form when formKey changes (currentRow changes) or drawer opens
  useEffect(() => {
    if (open) {
      if (formKey !== lastFormKeyRef.current || !wasOpenRef.current) {
        // Use requestAnimationFrame to ensure reset happens after render
        requestAnimationFrame(() => {
          form.reset(defaultValues)
          lastFormKeyRef.current = formKey
        })
      }
      wasOpenRef.current = true
    } else {
      wasOpenRef.current = false
    }
  }, [open, formKey, form, defaultValues])

  // Prevent form submission on Enter key press
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement
      // Allow Enter in textarea
      if (target.tagName === 'TEXTAREA') {
        return
      }
      // Prevent form submission on Enter key press in any input field
      if (
        target.tagName === 'INPUT' ||
        target.closest('input') ||
        target.closest('[role="combobox"]')
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }

  // Ensure parentId is set when creating a child page
  useEffect(() => {
    if (open && !isUpdate && currentRow?.parentId) {
      // When creating a child page, ensure parentId is set in the form
      const currentParentId = form.getValues('parentId')
      const parentIdValue = currentRow.parentId ?? undefined
      if (currentParentId !== parentIdValue) {
        requestAnimationFrame(() => {
          form.setValue('parentId', parentIdValue, { shouldValidate: false })
        })
      }
    }
  }, [open, isUpdate, currentRow?.parentId, form])

  const onReset = () => {
    toast.success(isUpdate ? 'Update Page Success!' : 'Create Page Success!')
    onOpenChange(false)
    form.reset()
    getQueryClient().invalidateQueries({
      queryKey: ['pages'],
    })
    getQueryClient().invalidateQueries({
      queryKey: ['pages-hierarchy'],
    })
  }

  const onSubmit = async (data: FormSchema) => {
    if (isUpdate) {
      const res = await updatePage({
        id: data.id!,
        name: data.name,
        url: data.url,
        icon: data.icon,
        parentId: data.parentId || null,
        orderIndex: data.orderIndex,
        isActive: data.isActive,
      })
      if (res.error !== null) {
        toast.error(res.error)
        return
      }
      if (res.data) {
        onReset()
      }
    } else {
      const res = await createPage({
        name: data.name,
        url: data.url,
        icon: data.icon,
        parentId: data.parentId || null,
        orderIndex: data.orderIndex,
        isActive: data.isActive,
      })

      if (res?.error) {
        toast.error(res.error)
        return
      }

      if (res?.data) {
        onReset()
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col mr-4 h-[calc(100dvh-32px)] my-auto rounded-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isUpdate
              ? currentRow?.parentId
                ? 'Update Child Page'
                : 'Update Page'
              : currentRow?.parentId
              ? 'Create Child Page'
              : 'Create Page'}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? currentRow?.parentId
                ? 'Update the child page information below.'
                : 'Update the page information below.'
              : currentRow?.parentId
              ? 'Create a new child page using the fields below.'
              : 'Create a new page using the fields below.'}
          </SheetDescription>
        </SheetHeader>
        <form
          key={formKey}
          id='form-page'
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={handleFormKeyDown}
          className='flex-1 space-y-6 overflow-y-auto px-4'
        >
          <FieldGroup>
            <div className='flex items-center gap-3'>
              {/* ICON */}
              <Controller
                name='icon'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='w-10'>
                    <FieldLabel htmlFor='page-icon'>Icon</FieldLabel>
                    <IconPicker
                      value={field.value as IconName}
                      onValueChange={field.onChange}
                      triggerPlaceholder=''
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* NAME */}
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='flex-1'>
                    <FieldLabel htmlFor='page-name'>
                      Name <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='page-name'
                      placeholder='Enter page name'
                      aria-invalid={fieldState.invalid}
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* URL */}
            <Controller
              name='url'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='page-url'>
                    Url <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <PagesUrlInputWithSuggestions
                    value={field.value}
                    onChange={field.onChange}
                    fieldState={fieldState}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* PARENT */}
            <Controller
              name='parentId'
              control={form.control}
              render={({ field, fieldState }) => {
                // Use field.value as the source of truth, convert null/undefined to 'none' for Select
                const selectValue = field.value ?? 'none'
                // Exclude the current page's ID from parent options (to prevent self-parenting)
                // Only exclude if we're in update mode (currentRow has a valid id)
                const excludeId =
                  isUpdate && currentRow?.id ? currentRow.id : undefined

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='page-parent'>Parent Page</FieldLabel>
                    <Select
                      value={selectValue}
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? undefined : value)
                      }
                    >
                      <SelectTrigger id='page-parent'>
                        <SelectValue placeholder='Select parent page' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>None (Top Level)</SelectItem>
                        {pagesData?.data &&
                          renderPageHierarchy(pagesData.data, 0, excludeId)}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            {/* ORDER INDEX */}
            <Controller
              name='orderIndex'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='page-order'>Order Index</FieldLabel>
                  <Input
                    {...field}
                    id='page-order'
                    type='number'
                    placeholder='0'
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* IS ACTIVE */}
            <Controller
              name='isActive'
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className='flex items-center justify-between'>
                    <FieldLabel htmlFor='page-active'>Active</FieldLabel>
                    <Switch
                      id='page-active'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            type='submit'
            form='form-page'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner />
                Saving
              </>
            ) : (
              <>{isUpdate ? 'Save changes' : 'Save'}</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
