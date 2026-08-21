import type { Metadata } from 'next'
import { Inter, Anton } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/use-auth'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const anton = Anton({
  subsets: ['latin'],
  variable: '--font-anton',
  weight: '400',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tuimpulso.ar'

const siteTitle = 'Impulso - Apoyá a quienes te inspiran'
const siteDescription = 'Apoyá a creadores independientes de Argentina. El apoyo va directo a su cuenta de MercadoPago.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: 'creadores, apoyo, comunidad, crowdfunding, MercadoPago, Argentina',
  // Default social preview for every page without its own. The image comes from
  // app/opengraph-image.tsx; child routes (profile, post) override title/desc/image.
  openGraph: {
    type: 'website',
    siteName: 'Impulso',
    title: siteTitle,
    description: siteDescription,
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
}

export const viewport = 'width=device-width, initial-scale=1'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${anton.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
