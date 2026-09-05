import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// --- Import -----------------------------------------------------------------

function cleanHeader(h) {
  return String(h ?? '').replace(/[\u200B-\u200F\u202A-\u202E]/g, '').trim()
}

export async function readTableFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv')) {
    return readCsv(file)
  }
  return readSheet(file)
}

function readCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      encoding: 'UTF-8',
      transformHeader: cleanHeader,
      complete: (res) => {
        const headers = (res.meta.fields || []).filter(Boolean)
        resolve({ headers, rows: res.data.filter((r) => Object.values(r).some((v) => String(v ?? '').trim())) })
      },
      error: reject,
    })
  })
}

async function readSheet(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: false, raw: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false })
  const headers = (XLSX.utils.sheet_to_json(ws, { header: 1, range: 0 })[0] || []).map(cleanHeader).filter(Boolean)
  const normalized = rows.map((r) => {
    const out = {}
    for (const [k, v] of Object.entries(r)) out[cleanHeader(k)] = v
    return out
  })
  return { headers: headers.length ? headers : Object.keys(normalized[0] || {}), rows: normalized }
}

// --- Export -----------------------------------------------------------------

export const GRADE_COLS = ['Grade', 'Graded By', 'Graded At']

export function buildExport(rows, headers, keyOf, grades, meta) {
  const outHeaders = [...headers.filter((h) => !GRADE_COLS.includes(h)), ...GRADE_COLS]
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const data = rows.map((row, i) => {
    const out = {}
    for (const h of outHeaders) out[h] = row[h] ?? ''
    out['Grade'] = grades[keyOf(row, i)] ?? ''
    out['Graded By'] = out['Grade'] === '' ? '' : meta.graderName
    out['Graded At'] = out['Grade'] === '' ? '' : stamp
    return out
  })
  return { headers: outHeaders, data }
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportCsv(headers, data, filename) {
  const csv = Papa.unparse({ fields: headers, data: data.map((r) => headers.map((h) => r[h] ?? '')) })
  // BOM ist Pflicht, sonst zeigt Excel arabischen Text als Kauderwelsch.
  download(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportXlsx(headers, data, filename) {
  const ws = XLSX.utils.json_to_sheet(data, { header: headers })
  ws['!views'] = [{ RTL: true }]
  ws['!cols'] = headers.map((h) => ({ wch: Math.min(Math.max(h.length + 4, 12), 44) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Grades')
  XLSX.writeFile(wb, filename)
}

export function timestampedName(base, ext) {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${base}_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}.${ext}`
}
