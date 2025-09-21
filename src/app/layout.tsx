import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/QueryProvider'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TextNotepad - Privacy-First Note Taking with End-to-End Encryption',
  description: 'Founders Promo 2025: Get TextNotepad completely free — 1 year (Personal) or 3 years (Secure Saver). E2EE, zero-knowledge, GDPR, distraction-free.',
  keywords: ['text editor', 'note taking', 'privacy', 'encryption', 'GDPR', 'zero knowledge', 'secure notes', 'distraction-free writing'],
  authors: [{ name: 'TextNotepad Team' }],
  creator: 'TextNotepad',
  publisher: 'TextNotepad',
  metadataBase: new URL('https://textnotepad.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://textnotepad.com',
    title: 'TextNotepad - Privacy-First Note Taking',
    description: 'Founders Promo 2025: Get TextNotepad completely free — 1 year (Personal) or 3 years (Secure Saver). Write in peace with ultra-secure notes.',
    siteName: 'TextNotepad',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TextNotepad - Privacy-First Note Taking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TextNotepad - Privacy-First Note Taking',
    description: 'Founders Promo 2025: Get TextNotepad completely free — 1 year (Personal) or 3 years (Secure Saver). Write in peace with ultra-secure notes.',
    images: ['/og-image.png'],
    creator: '@textnotepad',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
      >
        <SupabaseProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
