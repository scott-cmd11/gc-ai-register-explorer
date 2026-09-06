import type { SourceRecord } from './model'

export function sourcePageOffsets({
  total,
  rawFirstPageLength,
  pageSize,
}: {
  total: number
  rawFirstPageLength: number
  pageSize: number
}): number[] {
  if (total <= rawFirstPageLength) return []
  if (rawFirstPageLength < pageSize) {
    throw new Error('Upstream pagination ended before the reported source total.')
  }

  const offsets: number[] = []
  for (let offset = pageSize; offset < total; offset += pageSize) offsets.push(offset)
  return offsets
}

export function dedupeOfficialRecords(records: SourceRecord[]) {
  const seen = new Set<string>()
  const unique: SourceRecord[] = []
  let duplicates = 0

  for (const record of records) {
    const id = record.ai_register_id.trim()
    if (id && seen.has(id)) {
      duplicates += 1
      continue
    }
    if (id) seen.add(id)
    unique.push(record)
  }

  return { records: unique, duplicates }
}
