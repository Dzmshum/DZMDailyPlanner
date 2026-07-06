import { useEffect } from 'react'
import { usePlanStore } from '../store/planStore'
import {
  applyBackgroundImage,
  applyCustomThemeVars,
  clearCustomThemeVars,
} from '../lib/customTheme'
import type { ThemeMode } from '../types'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

export function useTheme() {
  const theme = usePlanStore((s) => s.data.settings.theme)
  const colorPalette = usePlanStore((s) => s.data.settings.colorPalette)
  const customTheme = usePlanStore((s) => s.data.settings.customTheme)

  useEffect(() => {
    const resolved = resolveTheme(theme)
    const root = document.documentElement
    root.setAttribute('data-theme', resolved)

    if (customTheme.enabled) {
      root.setAttribute('data-palette', 'custom')
      applyCustomThemeVars(root, customTheme)
      applyBackgroundImage(document.body, customTheme.backgroundImage)
    } else {
      root.setAttribute('data-palette', colorPalette)
      clearCustomThemeVars(root)
      applyBackgroundImage(document.body, null)
    }

    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', getSystemTheme())
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, colorPalette, customTheme])
}
