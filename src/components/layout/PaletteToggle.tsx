import type { ColorPalette } from '../../types'
import {
  COLOR_PALETTE_IDS,
  UNIVERSE_PALETTE_IDS,
  WOW_PALETTE_IDS,
} from '../../lib/palettes'
import { PALETTE_HINTS, PALETTE_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { BrandMark } from './BrandMark'

export const CUSTOM_THEME_CARD_ID = 'custom' as const

function PaletteGroup({
  title,
  palettes,
  activePalette,
  customActive,
  onSelectPalette,
}: {
  title: string
  palettes: ColorPalette[]
  activePalette: ColorPalette
  customActive: boolean
  onSelectPalette: (id: ColorPalette) => void
}) {
  return (
    <div className="palette-group">
      <h4 className="palette-group-title">{title}</h4>
      <div className="palette-grid">
        {palettes.map((id) => (
          <button
            key={id}
            type="button"
            className={`palette-card palette-preview-${id} ${!customActive && activePalette === id ? 'active' : ''}`}
            onClick={() => onSelectPalette(id)}
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

function CustomThemeCard({
  active,
  onSelect,
  accent,
  background,
}: {
  active: boolean
  onSelect: () => void
  accent: string
  background: string
}) {
  return (
    <div className="palette-group">
      <h4 className="palette-group-title">Своя</h4>
      <div className="palette-grid palette-grid-custom">
        <button
          type="button"
          className={`palette-card palette-preview-custom ${active ? 'active' : ''}`}
          onClick={onSelect}
          title="Произвольные цвета и фон"
        >
          <span
            className="palette-card-swatch palette-card-swatch-custom"
            style={{
              background: `linear-gradient(145deg, ${background}, ${accent})`,
            }}
            aria-hidden
          />
          <span className="palette-card-name">Моя тема</span>
          <span className="palette-card-hint">Цвета и фон по вашему вкусу</span>
        </button>
      </div>
    </div>
  )
}

export function PaletteToggle() {
  const palette = usePlanStore((s) => s.data.settings.colorPalette)
  const customTheme = usePlanStore((s) => s.data.settings.customTheme)
  const selectBuiltInPalette = usePlanStore((s) => s.selectBuiltInPalette)
  const selectCustomTheme = usePlanStore((s) => s.selectCustomTheme)

  return (
    <div className="palette-toggle">
      <PaletteGroup
        title="Базовая"
        palettes={['plain']}
        activePalette={palette}
        customActive={customTheme.enabled}
        onSelectPalette={selectBuiltInPalette}
      />
      <PaletteGroup
        title="World of Warcraft"
        palettes={WOW_PALETTE_IDS}
        activePalette={palette}
        customActive={customTheme.enabled}
        onSelectPalette={selectBuiltInPalette}
      />
      <PaletteGroup
        title="Вселенные"
        palettes={UNIVERSE_PALETTE_IDS}
        activePalette={palette}
        customActive={customTheme.enabled}
        onSelectPalette={selectBuiltInPalette}
      />
      <CustomThemeCard
        active={customTheme.enabled}
        onSelect={selectCustomTheme}
        accent={customTheme.accent}
        background={customTheme.background}
      />
      <span className="visually-hidden">
        Всего палитр: {COLOR_PALETTE_IDS.length} + своя тема
      </span>
    </div>
  )
}
