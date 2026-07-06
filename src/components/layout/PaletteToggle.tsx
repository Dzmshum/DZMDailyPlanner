import type { ColorPalette } from '../../types'
import { PALETTE_HINTS, PALETTE_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { BrandMark } from './BrandMark'

const PALETTES: ColorPalette[] = ['northrend', 'outland', 'pandaria']

export function PaletteToggle() {
  const palette = usePlanStore((s) => s.data.settings.colorPalette)
  const setColorPalette = usePlanStore((s) => s.setColorPalette)

  return (
    <div className="palette-toggle">
      <div className="palette-grid">
        {PALETTES.map((id) => (
          <button
            key={id}
            type="button"
            className={`palette-card palette-preview-${id} ${palette === id ? 'active' : ''}`}
            onClick={() => setColorPalette(id)}
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
