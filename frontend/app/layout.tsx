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

export const metadata: Metadata = {
  title: 'Impulso - Apoyá a quienes te inspiran',
  description: 'Plataforma para que artistas independientes reciban apoyo económico de su comunidad a cambio de contenido exclusivo',
  keywords: 'artistas, apoyo, comunidad, contenido exclusivo, crowdfunding',
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
