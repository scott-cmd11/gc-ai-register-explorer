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

export const SYSTEMS_REQUEST_TIMEOUT_MS = 25_000

export async function fetchAllSystems(
  fetchImpl: typeof fetch = fetch,
  timeoutMs = SYSTEMS_REQUEST_TIMEOUT_MS
): Promise<SystemsPayload> {
  const controller = new AbortController()
  const startedAt = Date.now()
  const remaining = () => Math.max(1, timeoutMs - (Date.now() - startedAt))
  try {
    const res = await withTimeout(
      fetchImpl('/api/systems', { signal: controller.signal }),
      remaining(),
      controller
    )
    if (!res.ok) throw new Error('Unable to load AI registry data. Please try again later.')
    const data = await withTimeout(res.json(), remaining(), controller)
    return parseSystemsPayload(data)
  } finally {
    controller.abort()
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, controller: AbortController) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error('The AI Register request timed out. Please try again.'))
    }, timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

function parseSystemsPayload(data: unknown): SystemsPayload {
  const payload = data as {
    records?: unknown
    warnings?: unknown
    lastModified?: unknown
    snapshotAt?: unknown
    total?: unknown
    changes?: unknown
  }
  if (!Array.isArray(payload.records)) {
    throw new Error('The AI registry response was not in the expected format.')
  }
  const warnings = Array.isArray(payload.warnings)
    ? payload.warnings.filter(
        (warning: unknown): warning is DataWarning =>
          warning !== null &&
          typeof warning === 'object' &&
          typeof (warning as DataWarning).code === 'string' &&
          typeof (warning as DataWarning).message === 'string'
      )
    : []
  return {
    systems: payload.records,
    lastModified: typeof payload.lastModified === 'string' ? payload.lastModified : null,
    snapshotAt: typeof payload.snapshotAt === 'string' ? payload.snapshotAt : null,
    total: Number.isFinite(Number(payload.total)) ? Number(payload.total) : null,
    warnings,
    changes: validChanges(payload.changes),
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
