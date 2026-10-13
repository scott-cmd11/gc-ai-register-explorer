import type { SourceRecord } from './register/model'
import type { RecordChanges } from './register/changes'

export interface SystemsPayload {
  systems: SourceRecord[]
  lastModified: string | null
  snapshotAt: string | null
  total: number | null
  warnings: DataWarning[]
  changes: RecordChanges | null
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
    ? data.warnings.filter(
        (warning: unknown): warning is DataWarning =>
          warning !== null &&
          typeof warning === 'object' &&
          typeof (warning as DataWarning).code === 'string' &&
          typeof (warning as DataWarning).message === 'string'
      )
    : []
  return {
    systems: data.records,
    lastModified: data.lastModified ?? null,
    snapshotAt: data.snapshotAt ?? null,
    total: Number.isFinite(Number(data.total)) ? Number(data.total) : null,
    warnings,
    changes: validChanges(data.changes),
  }
}

function validChanges(value: unknown): RecordChanges | null {
  const changes = value as RecordChanges | null
  return changes &&
    typeof changes.since === 'string' &&
    Array.isArray(changes.added) &&
    changes.added.every((id) => typeof id === 'string') &&
    Array.isArray(changes.updated) &&
    changes.updated.every((row) => typeof row?.id === 'string') &&
    Array.isArray(changes.removed) &&
    changes.removed.every((row) => typeof row?.id === 'string')
    ? changes
    : null
}
