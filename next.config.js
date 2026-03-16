/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      // Next.js 15 RSC hydration requires inline scripts (self.__next_f.push([...])),
      // so 'unsafe-inline' is necessary. This still blocks all external script sources.
      // In dev mode, React Refresh (HMR) also needs 'unsafe-eval'.
      // A nonce-based CSP via middleware would be stricter but adds significant complexity.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      // Styles: self + inline (Tailwind / CSS-in-JS inject inline styles at runtime)
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      // Google Fonts and Next.js font optimisation
      `font-src 'self' https://fonts.gstatic.com`,
      // Image sources: self + data URIs (favicon, inline SVGs)
      `img-src 'self' data:`,
      // Fetch targets: self (API route) + open.canada.ca (CKAN data)
      `connect-src 'self' https://open.canada.ca`,
      // Deny framing from all origins
      `frame-ancestors 'none'`,
      // No plugins, no object embeds
      `object-src 'none'`,
      // Upgrade insecure requests where possible
      `upgrade-insecure-requests`,
    ].join('; '),
  },
  {
    // Belt-and-suspenders clickjacking protection (for pre-CSP browsers)
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Prevent MIME-type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Limit referrer information sent on cross-origin navigations
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Restrict browser feature access
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
