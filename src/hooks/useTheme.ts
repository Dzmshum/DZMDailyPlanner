import { useEffect } from 'react'
import { usePlanStore } from '../store/planStore'
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

  useEffect(() => {
    const resolved = resolveTheme(theme)
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.setAttribute('data-palette', colorPalette)

    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', getSystemTheme())
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, colorPalette])
}
