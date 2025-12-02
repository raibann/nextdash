'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import Image from 'next/image'
import { EyeIcon, EyeOffIcon, Loader2, X } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import { toast } from 'sonner'
import { signUpWithEmail } from '@/server/actions/user-actions'
import { redirect } from 'next/navigation'

const formSchema = z.object({
  fullname: z.string().min(1, 'Fullname is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
  image: z.file().optional(),
  imagePreview: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)

  //   hooks
  const form = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
      image: undefined,
      imagePreview: undefined,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue('imagePreview', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormSchema) => {
    // console.table(data)
    const res = await signUpWithEmail({
      email: data.email,
      name: data.fullname,
      password: data.password,
      image: undefined,
    })

    if (res.error != null) {
      toast.error(res.error)
    }

    if (res.data) {
      toast.success('Successfully signed up!')
      redirect('/')
    }
  }

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const imagePreview = form.watch('imagePreview')

  return (
    <Card className='max-w-md min-w-sm'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>Sign Up</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id='form-sign-up' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className='grid gap-4'>
              <Controller
                name='fullname'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-fullname'>
                      Full Name <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='form-fullname'
                      aria-invalid={fieldState.invalid}
                      placeholder='John Doe'
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-email'>
                      Email <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='form-email'
                      aria-invalid={fieldState.invalid}
                      placeholder='user@example.com'
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-password'>
                      Password <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        id='form-password'
                        aria-invalid={fieldState.invalid}
                        placeholder='*******'
                        autoComplete='off'
                      />
                      <button
                        className='absolute right-2 top-0 h-full flex items-center justify-center px-2 cursor-pointer group transition-all ease-in-out duration-100'
                        onClick={handleShowPassword}
                        data-visible={showPassword}
                      >
                        <EyeOffIcon className='h-5 w-5 text-muted-foreground group-data-[visible=true]:hidden' />
                        <EyeIcon className='h-5 w-5 text-muted-foreground group-data-[visible=false]:hidden' />
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name='confirmPassword'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-confirm-password'>
                      Confirm Password{' '}
                      <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        id='form-confirm-password'
                        aria-invalid={fieldState.invalid}
                        placeholder='*******'
                        autoComplete='off'
                      />
                      <button
                        className='absolute right-2 top-0 h-full flex items-center justify-center px-2 cursor-pointer group transition-all ease-in-out duration-100'
                        onClick={handleShowPassword}
                        data-visible={showPassword}
                      >
                        <EyeOffIcon className='h-5 w-5 text-muted-foreground group-data-[visible=true]:hidden' />
                        <EyeIcon className='h-5 w-5 text-muted-foreground group-data-[visible=false]:hidden' />
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='image'
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='form-image'>Profile Image</FieldLabel>
                    <div className='flex items-end gap-4'>
                      {imagePreview && (
                        <div className='relative w-full h-20 rounded-sm overflow-hidden'>
                          <Image
                            src={imagePreview || ''}
                            alt='Profile preview'
                            layout='fill'
                            objectFit='contain'
                          />
                        </div>
                      )}
                      <div className='flex items-center gap-2 w-full'>
                        <Input
                          id='form-image'
                          type='file'
                          accept='image/*'
                          onChange={handleImageChange}
                          className='w-full'
                        />
                        {imagePreview && (
                          <X
                            className='cursor-pointer'
                            onClick={() => {
                              form.setValue('image', undefined)
                              form.setValue('imagePreview', undefined)
                            }}
                          />
                        )}
                      </div>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? (
                  <Loader2 size={16} className='animate-spin' />
                ) : (
                  'Create an account'
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      {/* <CardFooter>
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            Secured by <span className="text-orange-400">better-auth.</span>
          </p>
        </div>
      </CardFooter> */}
    </Card>
  )
}

// async function convertImageToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result as string);
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }
