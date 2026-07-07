import type { CustomThemeSettings } from '../types'
import { DEFAULT_CUSTOM_THEME, normalizeBackgroundGallery } from '../types'
import { isColorPalette } from './palettes'

const CUSTOM_CSS_VARS = [
  '--bg-primary',
  '--bg-secondary',
  '--bg-tertiary',
  '--bg-hover',
  '--text-primary',
  '--text-secondary',
  '--accent',
  '--accent-hover',
  '--accent-soft',
  '--accent-glow',
  '--border',
  '--border-ice',
] as const

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function getActiveBackgroundImage(theme: CustomThemeSettings): string | null {
  if (!theme.backgroundImageId) return null
  return (
    theme.backgroundImages.find((img) => img.id === theme.backgroundImageId)?.dataUrl ??
    null
  )
}

export function normalizeCustomTheme(raw: unknown): CustomThemeSettings {
  const d = DEFAULT_CUSTOM_THEME
  if (!raw || typeof raw !== 'object') return { ...d }
  const o = raw as Partial<CustomThemeSettings>
  const color = (v: unknown, fb: string) =>
    typeof v === 'string' && HEX_COLOR.test(v) ? v : fb
  const gallery = normalizeBackgroundGallery(o)
  return {
    enabled: Boolean(o.enabled),
    basedOn: isColorPalette(o.basedOn) ? o.basedOn : null,
    accent: color(o.accent, d.accent),
    background: color(o.background, d.background),
    surface: color(o.surface, d.surface),
    text: color(o.text, d.text),
    ...gallery,
    ambientEnabled: Boolean(o.ambientEnabled),
  }
}

export function applyCustomThemeVars(
  root: HTMLElement,
  theme: CustomThemeSettings,
): void {
  root.style.setProperty('--bg-primary', theme.background)
  root.style.setProperty('--bg-secondary', theme.surface)
  root.style.setProperty('--bg-tertiary', theme.surface)
  root.style.setProperty('--bg-hover', theme.surface)
  root.style.setProperty('--text-primary', theme.text)
  root.style.setProperty('--text-secondary', theme.text)
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-hover', theme.accent)
  root.style.setProperty('--accent-soft', `${theme.accent}24`)
  root.style.setProperty('--accent-glow', `${theme.accent}5c`)
  root.style.setProperty('--border', `${theme.text}33`)
  root.style.setProperty('--border-ice', `${theme.accent}44`)
  root.style.setProperty('--bg-frost', 'none')
  root.style.setProperty('--rune-glow', 'none')
  root.style.setProperty(
    '--sidebar-gradient',
    `linear-gradient(180deg, ${theme.background} 0%, ${theme.surface} 100%)`,
  )
  root.style.setProperty(
    '--header-gradient',
    `linear-gradient(90deg, ${theme.accent}14 0%, transparent 70%)`,
  )
}

export function clearCustomThemeVars(root: HTMLElement): void {
  for (const name of CUSTOM_CSS_VARS) {
    root.style.removeProperty(name)
  }
  root.style.removeProperty('--bg-frost')
  root.style.removeProperty('--rune-glow')
  root.style.removeProperty('--sidebar-gradient')
  root.style.removeProperty('--header-gradient')
}

export function applyBackgroundImage(body: HTMLElement, image: string | null): void {
  if (image) {
    body.classList.add('custom-bg-image')
    body.style.setProperty('--bg-custom-image', `url("${image}")`)
  } else {
    body.classList.remove('custom-bg-image')
    body.style.removeProperty('--bg-custom-image')
  }
}

export interface ThemeExportPayload {
  version: 1
  customTheme: CustomThemeSettings
}

export function exportThemeJson(theme: CustomThemeSettings): string {
  const payload: ThemeExportPayload = { version: 1, customTheme: theme }
  return JSON.stringify(payload, null, 2)
}

export function importThemeJson(raw: string): CustomThemeSettings | null {
  try {
    const parsed = JSON.parse(raw) as ThemeExportPayload
    if (parsed?.version !== 1 || !parsed.customTheme) return null
    return normalizeCustomTheme(parsed.customTheme)
  } catch {
    return null
  }
}
