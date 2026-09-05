import { useMemo, useState } from 'react'
import FileDrop from './FileDrop.jsx'
import Filters from './Filters.jsx'
import Stats from './Stats.jsx'
import { detectColumns, val } from '../lib/columns.js'
import { matchesQuery, compareText } from '../lib/arabic.js'
import { readTableFile, exportCsv, exportXlsx, timestampedName } from '../lib/fileIo.js'

const FILTER_FIELDS = ['cohort', 'ct', 'center', 'sessionName', 'scanDate', 'gender']

export default function MtaView({ t }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [table, setTable] = useState(null)
  const [filters, setFilters] = useState({})

  const colMap = useMemo(() => (table ? detectColumns(table.headers) : {}), [table])
  const hasGrade = Boolean(colMap.grade)

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
    return table.rows.filter((r) => {
      for (const f of FILTER_FIELDS) if (filters[f] && val(r, colMap, f) !== filters[f]) return false
      if (filters.q) {
        const hay = `${val(r, colMap, 'studentName')} ${val(r, colMap, 'studentId')}`
        if (!matchesQuery(hay, filters.q)) return false
      }
      return true
    })
  }, [table, colMap, filters])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareText(val(a, colMap, 'studentName'), val(b, colMap, 'studentName'))),
    [filtered, colMap],
  )

  const gradeValues = sorted.map((r) => val(r, colMap, 'grade')).filter((v) => v !== '')

  const doExport = (kind) => {
    const headers = table.headers
    const data = sorted.map((r) => Object.fromEntries(headers.map((h) => [h, r[h] ?? ''])))
    const name = timestampedName('grades_view', kind)
    kind === 'csv' ? exportCsv(headers, data, name) : exportXlsx(headers, data, name)
  }

  if (!table) {
    return (
      <div className="stack">
        <p className="lede">{t('mtaTagline')}</p>
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

      {!hasGrade && <p className="warn">{t('noGradeCol')}</p>}

      <Filters t={t} rows={table.rows} colMap={colMap} filters={filters} setFilters={setFilters} fields={FILTER_FIELDS} />

      {hasGrade && <Stats t={t} values={gradeValues} total={sorted.length} />}

      <div className="toolbar toolbar--end">
        <button type="button" className="btn" onClick={() => doExport('csv')}>{t('exportCsv')}</button>
        <button type="button" className="btn" onClick={() => doExport('xlsx')}>{t('exportXlsx')}</button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">{t('noRows')}</p>
      ) : (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-id">{t('studentId')}</th>
                <th>{t('student')}</th>
                {colMap.cohort && <th className="col-meta">{t('cohort')}</th>}
                {colMap.sessionName && <th className="col-meta">{t('sessionName')}</th>}
                {hasGrade && <th className="col-grade">{t('grade')}</th>}
                {colMap.gradedBy && <th className="col-meta">{t('gradedBy')}</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const g = val(r, colMap, 'grade')
                return (
                  <tr key={i}>
                    <td className="col-num">{i + 1}</td>
                    <td className="col-id num">{val(r, colMap, 'studentId')}</td>
                    <td className="name">{val(r, colMap, 'studentName')}</td>
                    {colMap.cohort && <td className="col-meta muted">{val(r, colMap, 'cohort')}</td>}
                    {colMap.sessionName && <td className="col-meta muted">{val(r, colMap, 'sessionName')}</td>}
                    {hasGrade && (
                      <td className="col-grade">
                        <span className={'gradechip num' + (g === '' ? ' gradechip--empty' : '')}>
                          {g === '' ? t('emptyGrade') : g}
                        </span>
                      </td>
                    )}
                    {colMap.gradedBy && <td className="col-meta muted">{val(r, colMap, 'gradedBy')}</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
