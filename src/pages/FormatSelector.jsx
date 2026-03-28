import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditor } from '../context/EditorContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const FORMATS = [
  {
    ratio: '9:16',
    nameKey: 'format_selector.vertical_name',
    descKey: 'format_selector.vertical_desc',
    sizeKey: 'format_selector.vertical_size',
    Preview: PreviewVertical,
  },
  {
    ratio: '16:9',
    nameKey: 'format_selector.horizontal_name',
    descKey: 'format_selector.horizontal_desc',
    sizeKey: 'format_selector.horizontal_size',
    Preview: PreviewHorizontal,
  },
  {
    ratio: '1:1',
    nameKey: 'format_selector.square_name',
    descKey: 'format_selector.square_desc',
    sizeKey: 'format_selector.square_size',
    Preview: PreviewSquare,
  },
]

export default function FormatSelector() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setRatio } = useEditor()
  const [selected, setSelected] = useState('9:16')

  const selectedFormat = FORMATS.find((f) => f.ratio === selected)

  function handleContinue() {
    setRatio(selected)
    navigate('/editor')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-5 pt-4 pb-3 bg-[#0a0a0a] border-b border-[#1f1f1f]">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-[#555] hover:text-[#aaa] transition-colors"
        >
          ← {t('nav.back')}
        </button>
        <span className="text-sm font-medium text-[#ccc]">
          {t('format_selector.title')}
        </span>
        <LanguageSwitcher />
      </nav>

      <main className="flex-1 px-5 pt-8 pb-6 flex flex-col">

        {/* Subtitle */}
        <p className="text-sm text-[#555] text-center mb-6">
          {t('format_selector.subtitle')}
        </p>

        {/* Format cards */}
        <div className="space-y-3 flex-1">
          {FORMATS.map((fmt) => {
            const isSelected = selected === fmt.ratio
            const Preview = fmt.Preview
            return (
              <button
                key={fmt.ratio}
                onClick={() => setSelected(fmt.ratio)}
                className={[
                  'w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-[#1f1008] border-[#e87040]'
                    : 'bg-[#161616] border-[#2a2a2a] hover:border-[#3a3a3a]',
                ].join(' ')}
              >
                {/* Ratio preview */}
                <div className="flex-shrink-0 w-14 h-[78px] flex items-center justify-center">
                  <Preview selected={isSelected} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium mb-0.5 ${isSelected ? 'text-white' : 'text-[#aaa]'}`}>
                    {t(fmt.nameKey)}
                  </p>
                  <p className={`text-xs mb-0.5 ${isSelected ? 'text-[#888]' : 'text-[#555]'}`}>
                    {t(fmt.descKey)}
                  </p>
                  <p className={`text-xs ${isSelected ? 'text-[#666]' : 'text-[#3a3a3a]'}`}>
                    {t(fmt.sizeKey)}
                  </p>
                </div>

                {/* Checkmark */}
                <div className={[
                  'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                  isSelected ? 'bg-[#e87040]' : 'border border-[#333]',
                ].join(' ')}>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4L3.8 7L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Warning */}
        <p className="text-xs text-[#444] text-center mt-6 mb-4">
          {t('format_selector.warning')}
        </p>

        {/* CTA */}
        <button onClick={handleContinue} className="btn-primary">
          {t('format_selector.cta', { format: t(selectedFormat.nameKey) })}
        </button>

      </main>
    </div>
  )
}

function PreviewVertical({ selected }) {
  return (
    <div className={`w-9 h-16 rounded flex items-center justify-center ${
      selected ? 'bg-[#2a1508] border border-[#e87040]' : 'bg-[#1a1a1a] border border-[#333]'
    }`}>
      <span className={`text-[9px] font-bold ${selected ? 'text-[#e87040]' : 'text-[#555]'}`}>9:16</span>
    </div>
  )
}

function PreviewHorizontal({ selected }) {
  return (
    <div className={`w-14 h-8 rounded flex items-center justify-center ${
      selected ? 'bg-[#2a1508] border border-[#e87040]' : 'bg-[#1a1a1a] border border-[#333]'
    }`}>
      <span className={`text-[9px] font-bold ${selected ? 'text-[#e87040]' : 'text-[#555]'}`}>16:9</span>
    </div>
  )
}

function PreviewSquare({ selected }) {
  return (
    <div className={`w-11 h-11 rounded flex items-center justify-center ${
      selected ? 'bg-[#2a1508] border border-[#e87040]' : 'bg-[#1a1a1a] border border-[#333]'
    }`}>
      <span className={`text-[9px] font-bold ${selected ? 'text-[#e87040]' : 'text-[#555]'}`}>1:1</span>
    </div>
  )
}
