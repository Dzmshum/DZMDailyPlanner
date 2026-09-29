import { usePlanStore } from '../store/planStore'
import { resolveIconPalette } from '../lib/paletteThemeColors'

export function useIconPalette() {
  const colorPalette = usePlanStore((s) => s.data.settings.colorPalette)
  const enabled = usePlanStore((s) => s.data.settings.customTheme.enabled)
  const basedOn = usePlanStore((s) => s.data.settings.customTheme.basedOn)
  return resolveIconPalette(colorPalette, { enabled, basedOn })
}
