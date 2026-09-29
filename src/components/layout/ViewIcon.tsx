import type { ColorPalette, ViewId } from '../../types'
import { VIEW_ICON_ALIASES } from '../../types'
import { assetUrl } from '../../lib/assetUrl'
import { useIconPalette } from '../../hooks/useIconPalette'

interface ViewIconProps {
  view: ViewId
  size?: 'xs' | 'sm' | 'md'
  palette?: ColorPalette
}

function resolveViewIcon(view: ViewId): string {
  return VIEW_ICON_ALIASES[view] ?? view
}

export function ViewIcon({ view, size = 'sm', palette: paletteProp }: ViewIconProps) {
  const iconPalette = useIconPalette()
  const palette = paletteProp ?? iconPalette
  const iconView = resolveViewIcon(view)

  const px = size === 'xs' ? 20 : size === 'sm' ? 28 : 36

  return (
    <img
      className={`view-icon view-icon-${size}`}
      src={assetUrl(`icons/views/${palette}/${iconView}.png`)}
      alt=""
      width={px}
      height={px}
      draggable={false}
    />
  )
}