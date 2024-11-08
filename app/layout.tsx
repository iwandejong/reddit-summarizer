import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './theme-provider'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reddit Thread Summarizer',
  description: 'AI-powered Reddit thread summarization tool',
  icons: {
    icon: '/reddit_recap.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}