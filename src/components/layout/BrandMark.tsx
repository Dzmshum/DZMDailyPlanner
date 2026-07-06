import type { ColorPalette } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { assetUrl } from '../../lib/assetUrl'

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'wordmark'
  palette?: ColorPalette
}

export function BrandMark({
  size = 'md',
  variant = 'icon',
  palette: paletteProp,
}: BrandMarkProps) {
  const storePalette = usePlanStore((s) => s.data.settings.colorPalette)
  const palette = paletteProp ?? storePalette
  const isWordmark = variant === 'wordmark'
  const folder = isWordmark ? 'icons/wordmark' : 'icons'

  return (
    <img
      className={`brand-mark brand-mark-${size}${isWordmark ? ' brand-mark-wordmark' : ''}`}
      src={assetUrl(`${folder}/${palette}.png`)}
      alt="PlanBoard"
      draggable={false}
    />
  )
}
