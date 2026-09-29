import { useEffect } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getViewCounts, getActiveProjects } from '../../lib/selectors'
import { NAV_ENTRIES, rememberNavView, viewForNavEntry } from '../../lib/nav'
import { BrandMark } from './BrandMark'
import { ViewIcon } from './ViewIcon'
import { UiIcon } from '../ui/UiIcon'

export function Sidebar() {
  const currentView = usePlanStore((s) => s.currentView)
  const setView = usePlanStore((s) => s.setView)
  const openSettings = usePlanStore((s) => s.openSettings)
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const agendaDate = usePlanStore((s) => s.agendaDate)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const dailyDays = usePlanStore((s) => s.data.settings.daily.days)

  const counts = getViewCounts(
    tasks,
    agendaDate,
    weekAnchor,
    dailyDays,
    getActiveProjects(projects).length,
  )

  useEffect(() => {
    rememberNavView(currentView)
  }, [currentView])

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark variant="wordmark" size="lg" />
      </div>

      <nav>
        <ul className="nav-list">
          {NAV_ENTRIES.map((entry) => {
            const active = entry.views.includes(currentView)
            const iconView = active ? currentView : entry.defaultView
            const count = counts[entry.defaultView]
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => {
                    if (active) return
                    setView(viewForNavEntry(entry))
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <ViewIcon view={iconView} size="xs" />
                  {entry.label}
                  <span className={`nav-count ${count > 0 ? 'has-items' : ''}`}>
                    {count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-item settings-btn" onClick={openSettings}>
          <UiIcon icon="settings" size="md" />
          Настройки
        </button>
      </div>
    </aside>
  )
}
