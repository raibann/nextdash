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

type PagesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Page
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  orderIndex: z.number().min(0),
  isActive: z.boolean(),
})

type FormSchema = z.infer<typeof formSchema>

export function PagesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PagesMutateDrawerProps) {
  const isUpdate = !!currentRow

  const { data: pagesData } = useQuery({
    queryKey: ['pages-hierarchy'],
    queryFn: listPageHierarchy,
  })

  type PageWithChildren = Page & {
    pages?: PageWithChildren[]
  }

  // Helper function to recursively render pages with hierarchy
  const renderPageHierarchy = (
    pages: PageWithChildren[],
    depth: number = 0,
    excludeId?: string
  ): React.ReactElement[] => {
    return pages
      .filter((page) => !excludeId || page.id !== excludeId)
      .flatMap((page, index, array): React.ReactElement[] => {
        const hasChildren = page.pages && page.pages.length > 0
        const indent = '  '.repeat(depth)
        const prefix =
          depth > 0 ? (index === array.length - 1 ? '└─' : '├─') : ''

        return [
          <SelectItem key={page.id} value={page.id}>
            <span className='flex items-center'>
              <span className='text-muted-foreground font-mono text-xs'>
                {indent}
                {prefix}
              </span>
              <span>{page.name}</span>
            </span>
          </SelectItem>,
          ...(hasChildren
            ? renderPageHierarchy(page.pages!, depth + 1, excludeId)
            : []),
        ]
      })
  }

  const form = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name ?? '',
      slug: currentRow?.slug ?? '',
      icon: currentRow?.icon ?? 'layout',
      parentId: currentRow?.parentId ?? null,
      orderIndex: currentRow?.orderIndex ?? 0,
      isActive: currentRow?.isActive ?? true,
    },
  })

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
        slug: data.slug,
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
        slug: data.slug,
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
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col mr-4 h-[calc(100dvh-32px)] my-auto rounded-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update Page' : 'Create Page'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the page information below.'
              : 'Create a new page using the fields below.'}
          </SheetDescription>
        </SheetHeader>

        <form
          id='form-page'
          onSubmit={form.handleSubmit(onSubmit)}
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

            {/* SLUG */}
            <Controller
              name='slug'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='page-slug'>
                    Slug <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id='page-slug'
                    placeholder='Enter page slug (e.g., dashboard)'
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
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
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='page-parent'>Parent Page</FieldLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) =>
                      field.onChange(value === 'none' ? null : value)
                    }
                  >
                    <SelectTrigger id='page-parent'>
                      <SelectValue placeholder='Select parent page' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None (Top Level)</SelectItem>
                      {pagesData?.data &&
                        renderPageHierarchy(pagesData.data, 0, currentRow?.id)}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
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
