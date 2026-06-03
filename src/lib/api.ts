import { AISystem } from './types'

export interface SystemsPayload {
  systems: AISystem[]
  lastModified: string | null
  total: number | null
  warnings: DataWarning[]
}

export interface DataWarning {
  code: string
  message: string
  total?: number
  returned?: number
  rejected?: number
}

export async function fetchAllSystems(): Promise<SystemsPayload> {
  const res = await fetch('/api/systems')
  if (!res.ok) throw new Error('Unable to load AI registry data. Please try again later.')
  const data = await res.json()
  if (!Array.isArray(data?.records)) {
    throw new Error('The AI registry response was not in the expected format.')
  }
  const warnings = Array.isArray(data.warnings)
    ? data.warnings.filter((warning: unknown): warning is DataWarning =>
      warning !== null &&
      typeof warning === 'object' &&
      typeof (warning as DataWarning).code === 'string' &&
      typeof (warning as DataWarning).message === 'string'
    )
    : []
  return {
    systems: data.records,
    lastModified: data.lastModified ?? null,
    total: Number.isFinite(Number(data.total)) ? Number(data.total) : null,
    warnings,
  }
}
