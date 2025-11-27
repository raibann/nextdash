import type { Metadata } from 'next'
import SignUpForm from './_components/signup-form'

export const metadata: Metadata = {
  title: 'Sign In',
  // description: 'Sign In page',
}
const SignUpPage = () => {
  return <SignUpForm />
}

export default SignUpPage
