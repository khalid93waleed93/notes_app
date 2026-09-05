import { compareText } from '../lib/arabic.js'
import { val } from '../lib/columns.js'

// Optionen für ein Feld = alle Werte, die nach Anwendung der *anderen* Filter noch übrig sind.
// So laufen die Dropdowns nie ins Leere.
function optionsFor(field, rows, colMap, filters, fields) {
  const others = fields.filter((f) => f !== field)
  const pool = rows.filter((r) => others.every((f) => !filters[f] || val(r, colMap, f) === filters[f]))
  return [...new Set(pool.map((r) => val(r, colMap, field)).filter(Boolean))].sort(compareText)
}

export default function Filters({ t, rows, colMap, filters, setFilters, fields }) {
  const active = fields.filter((f) => colMap[f])
  const anySet = active.some((f) => filters[f]) || filters.q

  return (
    <section className="filters" aria-label={t('filters')}>
      <div className="filters__grid">
        {active.map((field) => {
          const opts = optionsFor(field, rows, colMap, filters, active)
          return (
            <label key={field} className="field">
              <span className="field__label">{t(field)}</span>
              <select
                value={filters[field] || ''}
                onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
              >
                <option value="">{t('all')} ({opts.length})</option>
                {opts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          )
        })}

        <label className="field field--wide">
          <span className="field__label">{t('search')}</span>
          <input
            type="search"
            value={filters.q || ''}
            placeholder={t('search')}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
        </label>
      </div>

      {anySet && (
        <button type="button" className="btn btn--ghost" onClick={() => setFilters({})}>
          {t('reset')}
        </button>
      )}
    </section>
  )
}
