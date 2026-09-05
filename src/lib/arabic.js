// Normalisierung arabischer Strings für Suche und Vergleich.
// Ohne das findet die Suche nach "احمد" den Eintrag "أحمد" nicht.

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function toLatinDigits(s = '') {
  return String(s).replace(/[٠-٩۰-۹]/g, (d) => {
    const i = AR_DIGITS.indexOf(d)
    return i > -1 ? String(i) : String(FA_DIGITS.indexOf(d))
  })
}

export function arNorm(s = '') {
  return toLatinDigits(String(s))
    // Tashkeel + Tatweel entfernen
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Hamza-Varianten vereinheitlichen
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627') // أ إ آ ٱ -> ا
    .replace(/\u0649/g, '\u064A') // ى -> ي
    .replace(/\u0626/g, '\u064A') // ئ -> ي
    .replace(/\u0624/g, '\u0648') // ؤ -> و
    .replace(/\u0629/g, '\u0647') // ة -> ه
    .replace(/[\u06BE\u06C1\u06C2\u06D5]/g, '\u0647') // ھ ہ ۂ ە -> ه
    .replace(/\u06A9/g, '\u0643') // ک -> ك
    .replace(/\u06CC/g, '\u064A') // ی -> ي
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, '') // unsichtbare Richtungszeichen
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Prüft, ob alle Suchtokens irgendwo im Text vorkommen (Reihenfolge egal).
export function matchesQuery(text, query) {
  if (!query) return true
  const hay = arNorm(text)
  return arNorm(query)
    .split(' ')
    .filter(Boolean)
    .every((t) => hay.includes(t))
}

// Sortierung, die Arabisch korrekt behandelt.
const collator = new Intl.Collator(['ar', 'en'], { numeric: true, sensitivity: 'base' })
export const compareText = (a, b) => collator.compare(String(a ?? ''), String(b ?? ''))
