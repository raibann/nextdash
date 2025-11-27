'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { zodResolver } from '@hookform/resolvers/zod'
import { userTestData } from '@/lib/sample/user-data'
import { signInWithEmail } from '@/server/actions/user-actions'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

type FormSchemaType = z.infer<typeof formSchema>

export default function SignInForm({
  query,
}: {
  query: string | string[] | undefined
}) {
  // state
  const [showPassword, setShowPassword] = useState(false)

  // hooks
  const form = useForm<FormSchemaType>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userTestData.email,
      password: userTestData.password,
    },
  })

  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  const onSubmit = async (data: FormSchemaType) => {
    // console.table(data)
    const res = await signInWithEmail({
      email: data.email,
      password: data.password,
    })

    if (res.error != null && res.error instanceof Error) {
      toast.error(res.error.message)
    }

    if (res.data != null) {
      toast.success('Successfully signed in!')
      redirect(query ? query : '/')
    }
  }

  return (
    <Card className='min-w-sm max-w-md'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>Sign In</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <form id='form-sign-up' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className='grid gap-4'>
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
                  <p> Login </p>
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
        {/* <div
          className={cn(
            'w-full gap-2 flex items-center',
            'justify-between flex-col'
          )}
        >
          <Button
            variant='outline'
            className={cn('w-full gap-2')}
            // disabled={loading}
            // onClick={async () => {
            //   await signIn.social(
            //     {
            //       provider: 'google',
            //       callbackURL: '/',
            //     },
            //     {
            //       onRequest: () => {
            //         setLoading(true)
            //       },
            //       onResponse: () => {
            //         setLoading(false)
            //       },
            //     }
            //   )
            // }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='1em'
              height='1em'
              viewBox='0 0 256 262'
            >
              <path
                fill='#4285F4'
                d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
              ></path>
              <path
                fill='#34A853'
                d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
              ></path>
              <path
                fill='#FBBC05'
                d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z'
              ></path>
              <path
                fill='#EB4335'
                d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
              ></path>
            </svg>
            Sign in with Google
          </Button>
          <Button
            variant='outline'
            className={cn('w-full gap-2')}
            // disabled={loading}
            // onClick={async () => {
            //   await signIn.social(
            //     {
            //       provider: 'facebook',
            //       callbackURL: '/',
            //     },
            //     {
            //       onRequest: () => {
            //         setLoading(true)
            //       },
            //       onResponse: () => {
            //         setLoading(false)
            //       },
            //     }
            //   )
            // }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='1em'
              height='1em'
              viewBox='0 0 24 24'
            >
              <path
                d='M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592c.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z'
                fill='#1877F2'
              ></path>
            </svg>
            Sign in with Facebook
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}
