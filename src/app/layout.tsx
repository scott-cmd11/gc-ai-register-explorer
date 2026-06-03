import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { LANGUAGE_COOKIE, normalizeLang } from '@/lib/language'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const initialLang = normalizeLang(cookieStore.get(LANGUAGE_COOKIE)?.value) ?? 'en'

  return (
    <html lang={initialLang} className={`${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme and wrong language */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);var m=document.cookie.match(/(?:^|; )${LANGUAGE_COOKIE}=(en|fr)/);var l=m?m[1]:localStorage.getItem('lang');if(l==='en'||l==='fr'){document.documentElement.setAttribute('lang',l);localStorage.setItem('lang',l);document.cookie='${LANGUAGE_COOKIE}='+l+';path=/;max-age=31536000;samesite=lax'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen">
        <Providers initialLang={initialLang}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
