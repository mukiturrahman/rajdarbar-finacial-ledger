import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { LanguageProvider } from '@/components/LanguageProvider'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020617',
}

export const metadata: Metadata = {
  title: 'Rajdarbar Ledger',
  description: 'Event Management & Invoicing Dashboard for Rajdarbar Hall',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="font-sans antialiased text-text-primary bg-bg-base">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
