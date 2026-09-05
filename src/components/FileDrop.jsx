import { useRef, useState } from 'react'

export default function FileDrop({ t, onFile, busy }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)

  const pick = (files) => {
    const f = files && files[0]
    if (f) onFile(f)
  }

  return (
    <div
      className={'drop' + (over ? ' drop--over' : '')}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files) }}
    >
      <p className="drop__label">{busy ? t('loading') : t('drop')}</p>
      <button type="button" className="btn btn--primary" onClick={() => inputRef.current?.click()} disabled={busy}>
        {t('browse')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,.xls"
        hidden
        onChange={(e) => { pick(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}
