import { useTranslation } from 'react-i18next'

export default function SessionWarningBar() {
  const { t } = useTranslation()
  return (
    <div className="w-full bg-[#1a0d05] border-b border-[#2e1a09] px-4 py-1.5 text-center">
      <p className="text-[#c4623a] text-xs">{t('landing.session_warning')}</p>
    </div>
  )
}
