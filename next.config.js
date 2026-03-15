/** @type {import('next').NextConfig} */

// SHA-256 hash of the inline theme-detection script in src/app/layout.tsx.
// If that script is ever changed, recompute with:
//   printf '<script-content>' | openssl dgst -sha256 -binary | openssl base64
const THEME_SCRIPT_HASH = "'sha256-qf2BEjOWG/iJcyqzTTD2O5umIzxPf+PkrBbT5t5wnTk='"

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      // Allow the inline theme-detection script by its exact hash; no unsafe-inline needed
      `script-src 'self' ${THEME_SCRIPT_HASH}`,
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
