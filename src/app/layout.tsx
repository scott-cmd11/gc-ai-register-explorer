import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Providers } from './providers'
import { LANGUAGE_COOKIE, normalizeLang } from '@/lib/language'

export const metadata: Metadata = {
  metadataBase: new URL('https://explorer.scotthazlitt.ai'),
  title: 'AI Register — In plain sight',
  description:
    'Explore AI systems reported by federal organisations. Search records, inspect source information, and compare reporting patterns.',
  openGraph: {
    title: 'AI Register — In plain sight',
    description:
      'Explore AI systems reported by federal organisations. Search records, inspect source information, and compare reporting patterns.',
    url: '/',
    siteName: 'AI Register Explorer',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Register — In plain sight',
    description:
      'Explore AI systems reported by federal organisations. Search records, inspect source information, and compare reporting patterns.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const initialLang = normalizeLang(cookieStore.get(LANGUAGE_COOKIE)?.value) ?? 'en'

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme and wrong language */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(location.search);var t=p.get('theme')||localStorage.getItem('theme')||localStorage.getItem('ai-register.theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;var m=document.cookie.match(/(?:^|; )${LANGUAGE_COOKIE}=(en|fr)/);var l=p.get('lang')||(m?m[1]:localStorage.getItem('lang'));if(l==='en'||l==='fr'){document.documentElement.lang=l;localStorage.setItem('lang',l);document.cookie='${LANGUAGE_COOKIE}='+l+';path=/;max-age=31536000;samesite=lax'}}catch(e){}})()`,
          }}
        />
      </head>
      <body id="top">
        <Providers initialLang={initialLang}>{children}</Providers>
      </body>
    </html>
  )
}
