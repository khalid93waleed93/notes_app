import { arNorm } from './arabic.js'

// Logische Felder -> mögliche Header-Schreibweisen in der hochgeladenen Datei.
export const ALIASES = {
  studentId: ['student id', 'studentid', 'id', 'رقم الطالب', 'الرقم'],
  studentName: ['student name', 'studentname', 'name', 'اسم الطالب', 'الاسم'],
  cohort: ['cohort name', 'cohort', 'الشعبه', 'الشعبة'],
  gender: ['gender', 'الجنس'],
  unit: ['unit name', 'unit', 'الوحده', 'الوحدة'],
  sessionType: ['session type', 'نوع الجلسه', 'النوع'],
  sessionName: ['session name', 'session', 'اسم الجلسه', 'الامتحان'],
  ct: ['ct name', 'ct', 'course teacher', 'الماده', 'المادة'],
  center: ['center name', 'centre name', 'center', 'المعهد'],
  scanDate: ['scan date', 'date', 'التاريخ'],
  weekDay: ['scan week day', 'week day', 'weekday'],
  scanTime: ['scan time', 'time', 'الوقت'],
  weekNumber: ['scan week number', 'week number'],
  scannedBy: ['scanned by', 'scannedby'],
  admission: ['admission status'],
  exception: ['exception status'],
  // Spalten, die diese App selbst schreibt
  grade: ['grade', 'note', 'الدرجه', 'الدرجة'],
  gradedBy: ['graded by', 'المصحح'],
  gradedAt: ['graded at', 'وقت التصحيح'],
}

// Liefert { studentId: 'Student Id', ... } — nur für tatsächlich gefundene Spalten.
export function detectColumns(headers = []) {
  const map = {}
  const normHeaders = headers.map((h) => ({ raw: h, norm: arNorm(h) }))
  for (const [field, aliases] of Object.entries(ALIASES)) {
    const wanted = aliases.map(arNorm)
    const exact = normHeaders.find((h) => wanted.includes(h.norm))
    const partial = exact || normHeaders.find((h) => wanted.some((w) => h.norm && h.norm.includes(w)))
    if (partial) map[field] = partial.raw
  }
  return map
}

export const val = (row, colMap, field) => {
  const col = colMap[field]
  return col ? String(row[col] ?? '').trim() : ''
}

// Eindeutiger Schlüssel pro Prüfungsteilnahme.
// Ein Schüler taucht mehrfach auf (mehrere Sessions), daher reicht die Student Id nicht.
export function rowKey(row, colMap, index) {
  const parts = [
    val(row, colMap, 'studentId'),
    val(row, colMap, 'ct'),
    val(row, colMap, 'sessionName'),
    val(row, colMap, 'scanDate'),
    val(row, colMap, 'scanTime'),
  ].filter(Boolean)
  return parts.length ? parts.join('|') : `row#${index}`
}

export const REQUIRED = ['studentId', 'studentName']

// Feste Skala im Prototyp.
export const MAX_GRADE = 100
