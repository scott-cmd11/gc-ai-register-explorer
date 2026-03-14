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

interface FilterSectionProps {
  label: string
  value: string
  options: string[]
  placeholder: string
  onChange: (v: string) => void
}

function FilterSection({ label, value, options, placeholder, onChange }: FilterSectionProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {value && (
        <div className="mt-1.5">
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full">
            <span className="max-w-[160px] truncate">{value}</span>
            <button
              onClick={() => onChange('')}
              className="hover:text-red-900 leading-none"
              aria-label={`Remove ${label} filter`}
            >
              ✕
            </button>
          </span>
        </div>
      )}
    </div>
  )
}

export default function FilterPanel({ filters, onChange, options, onClear }: Props) {
  const hasAny = filters.department || filters.status || filters.personalInfo || filters.developedBy || filters.notificationAi

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Filters</h2>
        {hasAny && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700">
            Clear all
          </button>
        )}
      </div>

      <FilterSection
        label="Department"
        value={filters.department}
        options={options.departments}
        placeholder="All departments"
        onChange={(v) => onChange({ ...filters, department: v })}
      />

      <FilterSection
        label="Status"
        value={filters.status}
        options={options.statuses}
        placeholder="All statuses"
        onChange={(v) => onChange({ ...filters, status: v })}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Personal Data
        </label>
        <select
          value={filters.personalInfo}
          onChange={(e) => onChange({ ...filters, personalInfo: e.target.value })}
          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        >
          <option value="">Any</option>
          <option value="Y">Yes — handles personal data</option>
          <option value="N">No personal data</option>
        </select>
        {filters.personalInfo && (
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full">
              <span>{filters.personalInfo === 'Y' ? 'Has personal data' : 'No personal data'}</span>
              <button
                onClick={() => onChange({ ...filters, personalInfo: '' })}
                className="hover:text-red-900 leading-none"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      <FilterSection
        label="Developed By"
        value={filters.developedBy}
        options={options.developedBy}
        placeholder="All developer types"
        onChange={(v) => onChange({ ...filters, developedBy: v })}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Users Notified
        </label>
        <select
          value={filters.notificationAi}
          onChange={(e) => onChange({ ...filters, notificationAi: e.target.value })}
          className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
        >
          <option value="">Any</option>
          <option value="Y">Yes — users are notified</option>
          <option value="N">No notification</option>
        </select>
        {filters.notificationAi && (
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full">
              <span>{filters.notificationAi === 'Y' ? 'Users notified' : 'No notification'}</span>
              <button
                onClick={() => onChange({ ...filters, notificationAi: '' })}
                className="hover:text-red-900 leading-none"
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
