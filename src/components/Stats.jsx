import { MAX_GRADE } from '../lib/columns.js'

export function summarize(values) {
  const nums = values.map(Number).filter((n) => !Number.isNaN(n))
  if (!nums.length) return null
  const sum = nums.reduce((a, b) => a + b, 0)
  return { count: nums.length, avg: sum / nums.length, min: Math.min(...nums), max: Math.max(...nums), nums }
}

const fmt = (n) => (Math.round(n * 10) / 10).toString()

export default function Stats({ t, values, total }) {
  const s = summarize(values)

  // Fünf Bänder à 20 Punkte.
  const buckets = [0, 1, 2, 3, 4].map((i) => {
    const lo = i * 20
    const hi = lo + 20
    const n = s ? s.nums.filter((v) => (i === 4 ? v >= lo && v <= hi : v >= lo && v < hi)).length : 0
    return { lo, hi, n }
  })
  const peak = Math.max(1, ...buckets.map((b) => b.n))

  return (
    <div className="stats">
      <div className="stats__row">
        <Stat label={t('entered')} value={`${values.length} ${t('of')} ${total}`} />
        {s && <Stat label={t('average')} value={fmt(s.avg)} />}
        {s && <Stat label={t('highest')} value={fmt(s.max)} />}
        {s && <Stat label={t('lowest')} value={fmt(s.min)} />}
      </div>
      {s && (
        <div className="hist" aria-label={t('distribution')}>
          {buckets.map((b) => (
            <div key={b.lo} className="hist__bar" title={`${b.lo}–${b.hi}: ${b.n}`}>
              <div className="hist__fill" style={{ height: `${(b.n / peak) * 100}%` }} />
              <span className="hist__tick">{b.hi}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__value num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

export { MAX_GRADE }
