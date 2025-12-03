import './globals.css'
import { ThemeProvider } from '@/context/theme-provider'
import { Toaster } from 'sonner'
import { FontProvider } from '@/context/font-provider'
import { DirectionProvider } from '@/context/direction-provider'
import { Inter, Kantumruy_Pro, Manrope } from 'next/font/google'
import ReactQueryProviders from '@/context/react-query-provider'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${katumruyPro} antialiased`}
      >
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
      </body>
    </html>
  )
}
