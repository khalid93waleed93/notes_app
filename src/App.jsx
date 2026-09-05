import { useEffect, useMemo, useState } from 'react'
import GraderView from './components/GraderView.jsx'
import MtaView from './components/MtaView.jsx'
import { makeT, LANGS } from './lib/i18n.js'

export default function App() {
  const [lang, setLang] = useState('ar')
  const [role, setRole] = useState('grader')
  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = LANGS[lang].dir
  }, [lang])

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="topbar__title">{t('appTitle')}</h1>

        <div className="tabs" role="tablist">
          {['grader', 'mta'].map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              className={'tab' + (role === r ? ' tab--on' : '')}
              onClick={() => setRole(r)}
            >
              {t(r === 'grader' ? 'roleGrader' : 'roleMta')}
            </button>
          ))}
        </div>

        <div className="tabs tabs--lang">
          {Object.entries(LANGS).map(([code, meta]) => (
            <button
              key={code}
              className={'tab' + (lang === code ? ' tab--on' : '')}
              onClick={() => setLang(code)}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        {role === 'grader' ? <GraderView t={t} /> : <MtaView t={t} />}
      </main>
    </div>
  )
}
