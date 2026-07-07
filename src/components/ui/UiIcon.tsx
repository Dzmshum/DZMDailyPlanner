import type { ColorPalette } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { assetUrl } from '../../lib/assetUrl'

export type UiIconId =
  | 'window-compact'
  | 'window-expand'
  | 'window-maximize'
  | 'window-restore'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'checkbox-off'
  | 'checkbox-on'
  | 'settings'

interface UiIconProps {
  icon: UiIconId
  size?: 'xs' | 'sm' | 'md'
  palette?: ColorPalette
  className?: string
}

export function UiIcon({ icon, size = 'sm', palette: paletteProp, className }: UiIconProps) {
  const storePalette = usePlanStore((s) => s.data.settings.colorPalette)
  const palette = paletteProp ?? storePalette

  const px = size === 'xs' ? 14 : size === 'sm' ? 16 : 20

  return (
    <img
      className={['ui-icon', `ui-icon-${size}`, className].filter(Boolean).join(' ')}
      src={assetUrl(`icons/ui/${palette}/${icon}.png`)}
      alt=""
      width={px}
      height={px}
      draggable={false}
    />
  )
}
