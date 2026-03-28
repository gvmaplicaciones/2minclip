/**
 * Feature flags de 2minclip.
 * En v1 todo está apagado — sin límites, sin marca de agua, sin anuncios.
 * Para activar el modelo freemium, cambiar los valores sin tocar ningún componente.
 */
export const FEATURES = {
  MAX_CLIPS: null,      // null = sin límite | number = máx clips en el timeline
  MAX_DURATION: null,   // null = sin límite | number = duración máxima en segundos
  WATERMARK: false,     // true = añadir marca de agua 2minclip al exportar
  EXPORT_LIMIT: null,   // null = sin límite | number = exports máximos por día
  ADS_ENABLED: false,   // true = mostrar slots de AdSense
}
