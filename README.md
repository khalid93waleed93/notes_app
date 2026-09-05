# سجل الدرجات — Noten-Prototyp

Reines Frontend, kein Backend. React + Vite, manuell aufgesetzt (kein CRA).
Arabisch/Englisch mit echtem RTL, CSV/XLSX rein und raus.

## Manuelle Installation von Null

```bash
mkdir noten-app && cd noten-app
npm init -y
npm i react react-dom papaparse xlsx
npm i -D vite @vitejs/plugin-react
```

Dann `"type": "module"` und die Scripts in die `package.json` eintragen:

```json
"scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview --host" }
```

Danach die Dateien aus diesem Ordner übernehmen und starten:

```bash
npm run dev      # http://localhost:5173
npm run build    # dist/ – statisch, läuft auf jedem Webspace oder Cloudflare Pages
```

Es gibt keinen Server. `dist/` kannst du auf einen USB-Stick legen und offline öffnen,
wenn du in `vite.config.js` `base: './'` setzt.

## Verstandenes Datenmodell

Aus deinem Sheet (die PDF-Extraktion hat die Spalten wegen RTL verdreht):

| Spalte | Bedeutung im System |
|---|---|
| `Center Name` | Institut (معهد مارينا, معهد الريحاني زيونة) |
| `CT Name` | Fach + Dozent + Track — `انكليزي - سجاد العبيدي - علمي` |
| `Cohort Name` | CT Name + Anwesenheitsart + Gruppennummer |
| `Session Name` + `Session Type` | die konkrete Prüfung (`Exam`) |
| `Unit Name` | Unit bzw. Semester |
| `Scanned By` | Assistent, der das Heft gescannt hat |
| `Scan Date` / `Scan Time` | wann gescannt wurde |
| `Student Id` / `Student Name` | Schüler |

Wichtig: **ein Schüler taucht mehrfach auf** (mehrere Sessions am selben Tag).
Der Notenschlüssel ist deshalb `Student Id | CT Name | Session Name | Scan Date | Scan Time`,
nicht die Student Id allein.

## Ablauf

**1 — Mصحّح / Grader**
Datei hochladen → nach Institut, Fach/Dozent, Prüfung, Shuʿba filtern → Noten eintippen
(Enter oder ↓ springt in die nächste Zeile) → exportieren.

Der Export hängt drei Spalten an: `Grade`, `Graded By`, `Graded At`.
Der Rest der Datei bleibt unverändert, damit die Datei weiterverarbeitbar bleibt.
Notenskala fest 0–100.

**2 — MTA (nur lesen)**
Die exportierte Datei hochladen → nach `Cohort Name` (oder CT Name, Institut, Prüfung)
filtern → Noten lesen, Kennzahlen sehen, wieder exportieren. Keine Eingabefelder.

## Was hier bewusst gelöst ist

- **Arabische Suche.** `أحمد` und `احمد` sind derselbe Name. `src/lib/arabic.js` normalisiert
  Hamza-Varianten, ة/ه, ى/ي, Tashkeel und arabische Ziffern. Ohne das findet die Suche nichts.
- **Excel-Export mit BOM.** Ohne `\uFEFF` zeigt Excel arabischen Text als Kauderwelsch.
  Das XLSX-Sheet wird zusätzlich als RTL markiert.
- **Arabische Ziffern in der Eingabe.** ٠١٢ wird beim Tippen automatisch zu 012.
- **Kaskadierende Filter.** Ein Dropdown zeigt nur Werte, die nach den anderen Filtern
  noch übrig sind — kein Filtern ins Leere.
- **Zwischenspeicherung.** Eingetippte Noten liegen im `localStorage`. Bei Verbindungsabbruch
  oder versehentlichem Reload ist die Arbeit nicht weg.
- **Spaltenerkennung per Alias.** Header dürfen englisch oder arabisch sein und in der
  Schreibweise abweichen (`src/lib/columns.js`).

## Testdatei

`sample/scan-sheet-sample.csv` — 25 Zeilen aus deinem Sheet, Spalten in der richtigen
Reihenfolge, zwei Institute, fünf CT-Namen.

## Bekannte Grenzen des Prototyps

- Keine Authentifizierung. Die Rollentrennung ist ein Umschalter, keine Berechtigung.
- Keine Server-Persistenz, kein Audit-Trail. Wer wann welche Note geändert hat, steht nur
  in `Graded By` / `Graded At` des jeweiligen Exports.
- `Exception Status` wird nur durchgereicht, nicht ausgewertet.
- Ab etwa 5.000 sichtbaren Zeilen wird die Tabelle träge. Erst dann lohnt sich
  Virtualisierung (`@tanstack/react-virtual`).
