import './globals.css'
import { ThemeProvider } from '@/context/theme-provider'
import { Toaster } from 'sonner'
import { FontProvider } from '@/context/font-provider'
import { DirectionProvider } from '@/context/direction-provider'
import { Inter, Kantumruy_Pro, Manrope } from 'next/font/google'
import ReactQueryProviders from '@/context/react-query-provider'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'NextDash',
    template: `${process.env.NEXT_PUBLIC_APP_NAME || 'NextDash'} - %s`,
  },
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const katumruyPro = Kantumruy_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-katumruypro',
  display: 'swap',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${katumruyPro} antialiased`}
      >
        <NextIntlClientProvider>
          <ReactQueryProviders>
            <FontProvider>
              <ThemeProvider
                attribute='class'
                enableSystem
                disableTransitionOnChange
              >
                <DirectionProvider>
                  <Toaster position='top-right' />

                  {children}
                </DirectionProvider>
              </ThemeProvider>
            </FontProvider>
          </ReactQueryProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
