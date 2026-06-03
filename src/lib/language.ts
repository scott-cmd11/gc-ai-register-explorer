export type Lang = 'en' | 'fr'

export const LANGUAGE_COOKIE = 'ai-register-lang'

export function normalizeLang(value: unknown): Lang | null {
  return value === 'en' || value === 'fr' ? value : null
}
