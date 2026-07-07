import type { CustomThemeSettings } from '../../types'

interface ThemePreviewProps {
  theme: CustomThemeSettings
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div
      className="theme-preview-mini"
      style={{
        ['--preview-bg' as string]: theme.background,
        ['--preview-surface' as string]: theme.surface,
        ['--preview-text' as string]: theme.text,
        ['--preview-accent' as string]: theme.accent,
      }}
      aria-hidden
    >
      <div className="theme-preview-sidebar">
        <span className="theme-preview-nav active" />
        <span className="theme-preview-nav" />
        <span className="theme-preview-nav" />
      </div>
      <div className="theme-preview-main">
        <div className="theme-preview-card">
          <span className="theme-preview-card-title">Задача</span>
          <span className="theme-preview-card-badge">Средний</span>
        </div>
        <div className="theme-preview-card muted">
          <span className="theme-preview-card-title">Ещё задача</span>
        </div>
      </div>
    </div>
  )
}
