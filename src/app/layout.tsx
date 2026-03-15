import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Register Explorer',
  description: 'Search and explore AI systems used by the Government of Canada',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem('retro');if(r==='true'){document.documentElement.setAttribute('data-theme','retro');return}var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen">
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
