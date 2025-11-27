import type { Metadata } from 'next'
import SignInForm from './_components/signin-form'

export const metadata: Metadata = {
  title: 'Sign In',
  // description: 'Sign In page',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const SignInPage = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams
  const query = searchParams.redirect
  return <SignInForm query={query} />
}

export default SignInPage
