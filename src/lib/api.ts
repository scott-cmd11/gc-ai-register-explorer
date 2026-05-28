import { AISystem } from './types'

export interface SystemsPayload {
  systems: AISystem[]
  lastModified: string | null
}

export async function fetchAllSystems(): Promise<SystemsPayload> {
  const res = await fetch('/api/systems')
  if (!res.ok) throw new Error('Unable to load AI registry data. Please try again later.')
  const data = await res.json()
  if (!Array.isArray(data?.records)) {
    throw new Error('The AI registry response was not in the expected format.')
  }
  return { systems: data.records, lastModified: data.lastModified ?? null }
}
