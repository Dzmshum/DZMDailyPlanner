import type { ColorPalette } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { assetUrl } from '../../lib/assetUrl'

interface BrandMarkProps {
  size?: 'sm' | 'md'
  palette?: ColorPalette
}

export function BrandMark({ size = 'md', palette: paletteProp }: BrandMarkProps) {
  const storePalette = usePlanStore((s) => s.data.settings.colorPalette)
  const palette = paletteProp ?? storePalette

  return (
    <img
      className={`brand-mark brand-mark-${size}`}
      src={assetUrl(`icons/${palette}.png`)}
      alt=""
      width={size === 'sm' ? 28 : 36}
      height={size === 'sm' ? 28 : 36}
      draggable={false}
    />
  )
}
