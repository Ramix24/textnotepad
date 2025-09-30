import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/QueryProvider'
import SupabaseProvider from '@/components/SupabaseProvider'
import { Toaster } from '@/components/ui/sonner'
import { ClientProviders } from '@/components/ClientProviders'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TextNotepad - Privacy is freedom. Encrypted notes with no tracking.',
  description: 'Privacy is freedom. Secure, encrypted notes with no tracking.',
  keywords: ['privacy', 'encrypted notes', 'no tracking', 'secure notes', 'end-to-end encryption', 'zero surveillance', 'private notes'],
  authors: [{ name: 'TextNotepad Team' }],
  creator: 'TextNotepad',
  publisher: 'TextNotepad',
  metadataBase: new URL('https://textnotepad.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://textnotepad.com',
    title: 'TextNotepad - Privacy is freedom',
    description: 'Privacy is freedom. Encrypted notes with no tracking, ever.',
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
    title: 'TextNotepad - Privacy is freedom',
    description: 'Privacy is freedom. Encrypted notes with no tracking, ever.',
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
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <ClientProviders>
                {children}
                <Toaster />
              </ClientProviders>
            </ThemeProvider>
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
