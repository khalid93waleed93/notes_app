import { useEffect, useMemo, useState } from 'react'
import FileDrop from './FileDrop.jsx'
import Filters from './Filters.jsx'
import GradeTable from './GradeTable.jsx'
import Stats from './Stats.jsx'
import { detectColumns, rowKey, val, REQUIRED } from '../lib/columns.js'
import { matchesQuery, compareText } from '../lib/arabic.js'
import { readTableFile, buildExport, exportCsv, exportXlsx, timestampedName } from '../lib/fileIo.js'

const FILTER_FIELDS = ['center', 'ct', 'cohort', 'sessionName', 'sessionType', 'scanDate', 'scannedBy', 'gender']
const STORE = 'noten-app:session'

export default function GraderView({ t }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [table, setTable] = useState(null)
  const [filters, setFilters] = useState({})
  const [grades, setGrades] = useState({})
  const [graderName, setGraderName] = useState('')
  const [bulk, setBulk] = useState('')

  // Sitzung im Browser sichern — bei schlechter Verbindung geht sonst Arbeit verloren.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null')
      if (saved) {
        setGrades(saved.grades || {})
        setGraderName(saved.graderName || '')
      }
    } catch { /* ignorieren */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ grades, graderName }))
    } catch { /* Speicher voll o.ä. */ }
  }, [grades, graderName])

  const colMap = useMemo(() => (table ? detectColumns(table.headers) : {}), [table])
  const missing = REQUIRED.filter((f) => !colMap[f])
  const keyOf = (row, i) => rowKey(row, colMap, i)

  const load = async (f) => {
    setBusy(true)
    try {
      const parsed = await readTableFile(f)
      setTable(parsed)
      setFile(f)
      setFilters({})
    } finally {
      setBusy(false)
    }
  }

  const filtered = useMemo(() => {
    if (!table) return []
    const rows = table.rows.filter((r) => {
      for (const f of FILTER_FIELDS) if (filters[f] && val(r, colMap, f) !== filters[f]) return false
      if (filters.q) {
        const hay = `${val(r, colMap, 'studentName')} ${val(r, colMap, 'studentId')}`
        if (!matchesQuery(hay, filters.q)) return false
      }
      return true
    })
    return rows.sort((a, b) => compareText(val(a, colMap, 'studentName'), val(b, colMap, 'studentName')))
  }, [table, colMap, filters])

  const setGrade = (key, value) =>
    setGrades((g) => {
      const next = { ...g }
      if (value === '') delete next[key]
      else next[key] = value
      return next
    })

  const visibleValues = filtered.map((r, i) => grades[keyOf(r, i)]).filter((v) => v !== undefined && v !== '')

  const applyBulk = () => {
    if (bulk === '') return
    setGrades((g) => {
      const next = { ...g }
      filtered.forEach((r, i) => { next[keyOf(r, i)] = bulk })
      return next
    })
  }

  const clearVisible = () => {
    setGrades((g) => {
      const next = { ...g }
      filtered.forEach((r, i) => { delete next[keyOf(r, i)] })
      return next
    })
  }

  const doExport = (kind, scope) => {
    const rows = scope === 'all' ? table.rows : filtered
    const { headers, data } = buildExport(rows, table.headers, keyOf, grades, { graderName })
    const name = timestampedName(`grades_${scope}`, kind)
    kind === 'csv' ? exportCsv(headers, data, name) : exportXlsx(headers, data, name)
  }

  if (!table) {
    return (
      <div className="stack">
        <p className="lede">{t('graderTagline')}</p>
        <FileDrop t={t} onFile={load} busy={busy} />
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="filebar">
        <span className="filebar__name">{file?.name}</span>
        <span className="muted num">{table.rows.length} {t('rowsLoaded')}</span>
        <button type="button" className="btn btn--ghost" onClick={() => { setTable(null); setFile(null) }}>
          {t('changeFile')}
        </button>
      </div>

      {missing.length > 0 && (
        <p className="warn">{t('missingCols')} {missing.join(', ')}</p>
      )}

      <Filters t={t} rows={table.rows} colMap={colMap} filters={filters} setFilters={setFilters} fields={FILTER_FIELDS} />

      <div className="toolbar">
        <label className="field">
          <span className="field__label">{t('grader')}</span>
          <input type="text" value={graderName} onChange={(e) => setGraderName(e.target.value)} />
        </label>
        <label className="field field--narrow">
          <span className="field__label">{t('fillAll')}</span>
          <div className="inline">
            <input type="number" dir="ltr" value={bulk} onChange={(e) => setBulk(e.target.value)} />
            <button type="button" className="btn btn--ghost" onClick={applyBulk}>{t('apply')}</button>
          </div>
        </label>
        <button type="button" className="btn btn--ghost" onClick={clearVisible}>{t('clearGrades')}</button>
      </div>

      <Stats t={t} values={visibleValues} total={filtered.length} />

      <div className="toolbar toolbar--end">
        <span className="muted">{t('exportHint')}</span>
        <button type="button" className="btn btn--primary" onClick={() => doExport('xlsx', 'filtered')}>
          {t('exportXlsx')} · {t('exportFiltered')}
        </button>
        <button type="button" className="btn" onClick={() => doExport('csv', 'filtered')}>
          {t('exportCsv')} · {t('exportFiltered')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => doExport('xlsx', 'all')}>
          {t('exportAll')}
        </button>
      </div>

      <GradeTable
        t={t}
        rows={filtered}
        colMap={colMap}
        keyOf={keyOf}
        grades={grades}
        setGrade={setGrade}
      />

      <p className="muted footnote">{t('savedLocally')}</p>
    </div>
  )
}
