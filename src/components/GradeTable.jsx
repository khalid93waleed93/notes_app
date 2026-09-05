import { toLatinDigits } from '../lib/arabic.js'
import { val, MAX_GRADE } from '../lib/columns.js'

export default function GradeTable({ t, rows, colMap, keyOf, grades, setGrade }) {
  const focusRow = (index) => {
    const el = document.querySelector(`input[data-grade-index="${index}"]`)
    if (el) { el.focus(); el.select() }
  }

  const onKeyDown = (e, i) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); focusRow(i + 1) }
    if (e.key === 'ArrowUp') { e.preventDefault(); focusRow(i - 1) }
  }

  const onChange = (e, key) => {
    // Arabische Ziffern werden beim Tippen automatisch zu westlichen umgewandelt.
    const raw = toLatinDigits(e.target.value).replace(/[^\d.,]/g, '').replace(',', '.')
    setGrade(key, raw)
  }

  if (!rows.length) return <p className="empty">{t('noRows')}</p>

  return (
    <div className="tablewrap">
      <table className="table">
        <thead>
          <tr>
            <th className="col-num">#</th>
            <th className="col-id">{t('studentId')}</th>
            <th>{t('student')}</th>
            {colMap.cohort && <th className="col-meta">{t('cohort')}</th>}
            {colMap.sessionName && <th className="col-meta">{t('sessionName')}</th>}
            <th className="col-grade">{t('grade')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const key = keyOf(row, i)
            const value = grades[key] ?? ''
            const num = value === '' ? null : Number(value)
            const bad = num !== null && (Number.isNaN(num) || num < 0 || num > MAX_GRADE)
            return (
              <tr key={key} className={value !== '' ? 'row--done' : ''}>
                <td className="col-num">{i + 1}</td>
                <td className="col-id num">{val(row, colMap, 'studentId')}</td>
                <td className="name">{val(row, colMap, 'studentName')}</td>
                {colMap.cohort && <td className="col-meta muted">{val(row, colMap, 'cohort')}</td>}
                {colMap.sessionName && <td className="col-meta muted">{val(row, colMap, 'sessionName')}</td>}
                <td className="col-grade">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    className={'gradeinput' + (bad ? ' gradeinput--bad' : '')}
                    data-grade-index={i}
                    value={value}
                    placeholder="—"
                    aria-label={`${t('grade')} ${val(row, colMap, 'studentName')}`}
                    title={bad ? `${t('outOfRange')} (0–${MAX_GRADE})` : undefined}
                    onChange={(e) => onChange(e, key)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onFocus={(e) => e.target.select()}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
