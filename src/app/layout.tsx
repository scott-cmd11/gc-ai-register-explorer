import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const body = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-register-explorer.vercel.app'),
  title: 'AI Register Explorer',
  description: 'Search and explore AI systems used by the Government of Canada',
  openGraph: {
    title: 'AI Register Explorer',
    description: 'Search and explore AI systems used by the Government of Canada',
    url: '/',
    siteName: 'AI Register Explorer',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Register Explorer',
    description: 'Search and explore AI systems used by the Government of Canada',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme and wrong language */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);var l=localStorage.getItem('lang');if(l==='fr')document.documentElement.setAttribute('lang','fr')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
