import { AISystem } from './types'

export interface SystemsPayload {
  systems: AISystem[]
  lastModified: string | null
}

export async function fetchAllSystems(): Promise<SystemsPayload> {
  const res = await fetch('/api/systems')
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`)
  const data = await res.json()
  return { systems: data.records, lastModified: data.lastModified ?? null }
}
