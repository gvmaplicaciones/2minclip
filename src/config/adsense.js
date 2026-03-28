/**
 * Configuración de Google AdSense.
 *
 * Pasos para activar los anuncios:
 *  1. Sustituye PUBLISHER_ID por tu ID real (empieza por "ca-pub-")
 *  2. Sustituye los SLOTS por los IDs de unidad de anuncio de tu cuenta
 *  3. Pon ADS_ENABLED = true en src/config/features.js
 *
 * Dimensiones de cada placement:
 *  - BANNER       → 320×50 px  (tira fina encima de los botones de acción)
 *  - PRE_DOWNLOAD → 300×250 px (rectángulo en la pantalla de exportación, encima del botón de descarga)
 */
export const ADSENSE = {
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX',   // ← reemplazar por tu publisher ID real
  SLOTS: {
    BANNER:       'XXXXXXXXXX',              // ← ID de unidad 320×50  (banner)
    PRE_DOWNLOAD: 'XXXXXXXXXX',              // ← ID de unidad 300×250 (pre-descarga)
  },
}
