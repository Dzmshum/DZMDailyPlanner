import type { ColorPalette } from '../../types'
import {
  COLOR_PALETTE_IDS,
  UNIVERSE_PALETTE_IDS,
  WOW_PALETTE_IDS,
} from '../../lib/palettes'
import { PALETTE_HINTS, PALETTE_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { BrandMark } from './BrandMark'

function PaletteGroup({
  title,
  palettes,
  active,
  onSelect,
}: {
  title: string
  palettes: ColorPalette[]
  active: ColorPalette
  onSelect: (id: ColorPalette) => void
}) {
  return (
    <div className="palette-group">
      <h4 className="palette-group-title">{title}</h4>
      <div className="palette-grid">
        {palettes.map((id) => (
          <button
            key={id}
            type="button"
            className={`palette-card palette-preview-${id} ${active === id ? 'active' : ''}`}
            onClick={() => onSelect(id)}
            title={PALETTE_HINTS[id]}
          >
            <span className="palette-card-icon" aria-hidden>
              <BrandMark size="sm" palette={id} />
            </span>
            <span className="palette-card-swatch" aria-hidden />
            <span className="palette-card-name">{PALETTE_LABELS[id]}</span>
            <span className="palette-card-hint">{PALETTE_HINTS[id]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function PaletteToggle() {
  const palette = usePlanStore((s) => s.data.settings.colorPalette)
  const customEnabled = usePlanStore((s) => s.data.settings.customTheme.enabled)
  const setColorPalette = usePlanStore((s) => s.setColorPalette)
  const disableCustomTheme = usePlanStore((s) => s.disableCustomTheme)

  const onSelect = (id: ColorPalette) => {
    if (customEnabled) disableCustomTheme()
    setColorPalette(id)
  }

  return (
    <div className="palette-toggle">
      <PaletteGroup
        title="Базовая"
        palettes={['plain']}
        active={palette}
        onSelect={onSelect}
      />
      <PaletteGroup
        title="World of Warcraft"
        palettes={WOW_PALETTE_IDS}
        active={palette}
        onSelect={onSelect}
      />
      <PaletteGroup
        title="Вселенные"
        palettes={UNIVERSE_PALETTE_IDS}
        active={palette}
        onSelect={onSelect}
      />
      <span className="visually-hidden">
        Всего палитр: {COLOR_PALETTE_IDS.length}
      </span>
    </div>
  )
}
