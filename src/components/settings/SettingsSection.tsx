import type { ReactNode } from 'react'
import { sectionMatchesQuery, SETTINGS_SECTIONS } from '../../lib/settingsNav'

export function SettingsSection({
  id,
  hint,
  query,
  children,
}: {
  id: string
  hint?: string
  query: string
  children: ReactNode
}) {
  const section = SETTINGS_SECTIONS.find((item) => item.id === id)
  if (!section || !sectionMatchesQuery(section, query)) return null

  return (
    <section id={`settings-section-${id}`} className="settings-block" data-settings-section={id}>
      <h3 className="settings-section-title">{section.title}</h3>
      {hint ? <p className="settings-hint">{hint}</p> : null}
      {children}
    </section>
  )
}
