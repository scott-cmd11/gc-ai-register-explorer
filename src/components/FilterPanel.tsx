import { Filters } from '@/lib/types'

interface Options {
  departments: string[]
  statuses: string[]
  developedBy: string[]
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  options: Options
  onClear: () => void
}

function ToolbarSelect({
  id, label, value, options, placeholder, onChange
}: {
  id: string; label: string; value: string; options: string[]; placeholder: string; onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-md pl-3 pr-8 py-1.5 transition-all appearance-none cursor-pointer"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          minWidth: '130px',
        }}
        onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px var(--ring)'}
        onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
        style={{ color: 'var(--text-muted)' }}
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  )
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium pl-2 pr-1 py-0.5 rounded-md transition-colors"
      style={{
        background: 'var(--accent-light)',
        color: 'var(--accent-text)',
      }}
    >
      <span className="max-w-[160px] truncate">{label}</span>
      <button
        onClick={onRemove}
        className="h-4 w-4 rounded flex items-center justify-center transition-opacity hover:opacity-60"
        aria-label={`Remove filter: ${label}`}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}

export default function FilterPanel({ filters, onChange, options, onClear }: Props) {
  const activeFilters: { label: string; clear: () => void }[] = []
  if (filters.department) activeFilters.push({ label: filters.department, clear: () => onChange({ ...filters, department: '' }) })
  if (filters.status) activeFilters.push({ label: filters.status, clear: () => onChange({ ...filters, status: '' }) })
  if (filters.personalInfo) activeFilters.push({ label: filters.personalInfo === 'Y' ? 'Has personal data' : 'No personal data', clear: () => onChange({ ...filters, personalInfo: '' }) })
  if (filters.developedBy) activeFilters.push({ label: filters.developedBy, clear: () => onChange({ ...filters, developedBy: '' }) })
  if (filters.notificationAi) activeFilters.push({ label: filters.notificationAi === 'Y' ? 'Users notified' : 'No notification', clear: () => onChange({ ...filters, notificationAi: '' }) })

  return (
    <div className="space-y-2">
      {/* Filter dropdowns row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-1">
          <svg className="h-4 w-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Filters</span>
        </div>

        <ToolbarSelect
          id="filter-department" label="Department"
          value={filters.department} options={options.departments}
          placeholder="Department"
          onChange={(v) => onChange({ ...filters, department: v })}
        />
        <ToolbarSelect
          id="filter-status" label="Status"
          value={filters.status} options={options.statuses}
          placeholder="Status"
          onChange={(v) => onChange({ ...filters, status: v })}
        />
        <ToolbarSelect
          id="filter-personal-data" label="Personal Data"
          value={filters.personalInfo}
          options={['Y', 'N']}
          placeholder="Personal Data"
          onChange={(v) => onChange({ ...filters, personalInfo: v })}
        />
        <ToolbarSelect
          id="filter-developed-by" label="Developed By"
          value={filters.developedBy} options={options.developedBy}
          placeholder="Developed By"
          onChange={(v) => onChange({ ...filters, developedBy: v })}
        />
        <ToolbarSelect
          id="filter-notification" label="Users Notified"
          value={filters.notificationAi}
          options={['Y', 'N']}
          placeholder="Notification"
          onChange={(v) => onChange({ ...filters, notificationAi: v })}
        />
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap" aria-live="polite" aria-atomic="true">
          {activeFilters.map((f) => (
            <FilterBadge key={f.label} label={f.label} onRemove={f.clear} />
          ))}
          <button
            onClick={onClear}
            className="text-xs font-medium ml-1 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
