import type { Snapshot } from './changes.ts'

export function sourceFailureResult(snapshot: Snapshot | null) {
  if (!snapshot) {
    return {
      status: 502,
      body: { error: 'Unable to retrieve data. Please try again later.' },
    } as const
  }
  return {
    status: 200,
    body: {
      records: snapshot.records,
      lastModified: snapshot.lastModified,
      snapshotAt: snapshot.capturedAt,
      total: snapshot.total,
      warnings: [
        {
          code: 'stale_snapshot' as const,
          message: 'The live source was unavailable; this page is showing its latest stored snapshot.',
        },
      ],
      changes: null,
    },
  } as const
}
