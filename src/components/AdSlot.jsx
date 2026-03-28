import { useEffect } from 'react'
import { FEATURES } from '../config/features'
import { ADSENSE } from '../config/adsense'

/**
 * Inyecta el script de AdSense una sola vez en el <head>.
 * Se llama solo cuando ADS_ENABLED = true.
 */
function loadAdSenseScript() {
  if (document.querySelector('script[data-adsense-loaded]')) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.PUBLISHER_ID}`
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-adsense-loaded', 'true')
  document.head.appendChild(script)
}

/**
 * Slot de AdSense.
 * Si ADS_ENABLED es false, no renderiza nada — ni espacio ni hueco.
 * Cuando se active, los dos placements aparecen automáticamente.
 *
 * @param {'banner' | 'pre-download'} variant
 *   - 'banner'       → 320×50 px — encima de los botones de acción del editor
 *   - 'pre-download' → 300×250 px — en la pantalla de exportar, encima del botón de descarga
 */
export default function AdSlot({ variant }) {
  useEffect(() => {
    if (!FEATURES.ADS_ENABLED) return
    loadAdSenseScript()
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (_) {}
  }, [])

  if (!FEATURES.ADS_ENABLED) return null

  if (variant === 'banner') {
    return (
      <div className="w-full flex justify-center py-1 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client={ADSENSE.PUBLISHER_ID}
          data-ad-slot={ADSENSE.SLOTS.BANNER}
        />
      </div>
    )
  }

  if (variant === 'pre-download') {
    return (
      <div className="w-full flex justify-center pt-3 pb-1">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '300px', height: '250px' }}
          data-ad-client={ADSENSE.PUBLISHER_ID}
          data-ad-slot={ADSENSE.SLOTS.PRE_DOWNLOAD}
        />
      </div>
    )
  }

  return null
}
