import { FEATURES } from '../config/features'

/**
 * Slot de AdSense.
 * Si ADS_ENABLED es false, no renderiza nada — ni el espacio ni el hueco.
 * Cuando se active, aparecen los placements sin tocar el resto del código.
 *
 * @param {'banner' | 'pre-download'} variant
 *   - 'banner'       → tira fina 320×50 encima de los botones de acción
 *   - 'pre-download' → bloque en pantalla de exportar antes de la descarga
 */
export default function AdSlot({ variant }) {
  if (!FEATURES.ADS_ENABLED) return null

  if (variant === 'banner') {
    return (
      <div className="w-full flex justify-center py-1 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        {/* TODO: reemplazar por código AdSense real cuando esté aprobado */}
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
        />
      </div>
    )
  }

  if (variant === 'pre-download') {
    return (
      <div className="w-full flex justify-center py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        {/* TODO: reemplazar por código AdSense real cuando esté aprobado */}
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '300px', height: '250px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
        />
      </div>
    )
  }

  return null
}
