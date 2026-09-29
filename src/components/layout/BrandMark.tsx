import type { ColorPalette } from '../../types'
import { assetUrl } from '../../lib/assetUrl'
import { useIconPalette } from '../../hooks/useIconPalette'

interface BrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'wordmark'
  palette?: ColorPalette
}

export function BrandMark({
  size = 'md',
  variant = 'icon',
  palette: paletteProp,
}: BrandMarkProps) {
  const iconPalette = useIconPalette()
  const palette = paletteProp ?? iconPalette
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
