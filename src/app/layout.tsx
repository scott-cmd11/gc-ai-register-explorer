import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GC AI Register Explorer',
  description: 'Search and explore AI systems used by the Government of Canada',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-gray-900 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
