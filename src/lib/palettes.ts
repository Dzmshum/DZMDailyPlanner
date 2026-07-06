import type { ColorPalette } from '../types'

export const COLOR_PALETTE_IDS: ColorPalette[] = [
  'plain',
  'northrend',
  'outland',
  'pandaria',
  'starwars',
  'got',
  'witcher',
]

export const WOW_PALETTE_IDS: ColorPalette[] = ['northrend', 'outland', 'pandaria']

export const UNIVERSE_PALETTE_IDS: ColorPalette[] = ['starwars', 'got', 'witcher']

const PALETTE_SET = new Set<string>(COLOR_PALETTE_IDS)

export function isColorPalette(value: unknown): value is ColorPalette {
  return typeof value === 'string' && PALETTE_SET.has(value)
}

export function normalizeColorPalette(value: unknown): ColorPalette {
  return isColorPalette(value) ? value : 'plain'
}
