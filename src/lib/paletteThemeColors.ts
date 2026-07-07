import type { ColorPalette, CustomThemeSettings } from '../types'

/** Тёмная тема палитр — для «Создать на основе…» */
const PALETTE_DARK_COLORS: Record<
  ColorPalette,
  Pick<CustomThemeSettings, 'accent' | 'background' | 'surface' | 'text'>
> = {
  plain: {
    accent: '#6b8cff',
    background: '#121418',
    surface: '#1a1d24',
    text: '#e8eaed',
  },
  northrend: {
    accent: '#30cfea',
    background: '#050810',
    surface: '#0a1018',
    text: '#e8f4fc',
  },
  outland: {
    accent: '#92d038',
    background: '#0a0612',
    surface: '#140e1c',
    text: '#ece8f4',
  },
  pandaria: {
    accent: '#5ad890',
    background: '#141210',
    surface: '#1c1814',
    text: '#fff8ee',
  },
  starwars: {
    accent: '#4da6ff',
    background: '#060a14',
    surface: '#0c1220',
    text: '#e8f0ff',
  },
  got: {
    accent: '#8b1538',
    background: '#100c10',
    surface: '#1a1518',
    text: '#f0ece8',
  },
  witcher: {
    accent: '#c87533',
    background: '#12100e',
    surface: '#1a1814',
    text: '#ece6dc',
  },
}

export function createCustomThemeFromPalette(
  palette: ColorPalette,
  current: CustomThemeSettings,
): CustomThemeSettings {
  const colors = PALETTE_DARK_COLORS[palette]
  return {
    ...current,
    ...colors,
    basedOn: palette,
    enabled: true,
  }
}
