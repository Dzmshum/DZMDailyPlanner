import type { ThemeMode } from '../../types'
import { usePlanStore } from '../../store/planStore'

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
  { id: 'system', label: 'Система' },
]

export function ThemeToggle() {
  const theme = usePlanStore((s) => s.data.settings.theme)
  const setTheme = usePlanStore((s) => s.setTheme)

  return (
    <div className="theme-toggle">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className={`theme-btn ${theme === t.id ? 'active' : ''}`}
          onClick={() => setTheme(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
