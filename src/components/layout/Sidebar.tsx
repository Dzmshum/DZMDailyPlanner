import { useEffect, useRef, useState } from 'react'
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
  const sidebarMode = usePlanStore((s) => s.data.settings.navigation?.sidebarMode ?? 'expanded')
  const setSidebarMode = usePlanStore((s) => s.setSidebarMode)
  const [revealed, setRevealed] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const reveal = () => {
    if (sidebarMode !== 'peek') return
    clearCloseTimer()
    setRevealed(true)
  }

  const scheduleHide = () => {
    if (sidebarMode !== 'peek') return
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setRevealed(false), 400)
  }

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

  useEffect(() => {
    if (sidebarMode !== 'peek') {
      clearCloseTimer()
      setRevealed(false)
    }
  }, [sidebarMode])

  useEffect(() => () => clearCloseTimer(), [])

  const menuHidden = sidebarMode === 'peek' && !revealed

  return (
    <aside
      className={`sidebar titlebar-no-drag${revealed ? ' sidebar--open' : ''}`}
      onMouseEnter={reveal}
      onMouseLeave={scheduleHide}
    >
      <div className="sidebar-brand" inert={menuHidden}>
        <BrandMark variant="wordmark" size="lg" />
      </div>

      <nav inert={menuHidden}>
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
        <button
          type="button"
          className="sidebar-toggle titlebar-no-drag"
          aria-label={sidebarMode === 'peek' ? 'Показать меню' : 'Скрыть меню'}
          title={sidebarMode === 'peek' ? 'Показать меню ([)' : 'Скрыть меню ([)'}
          onClick={() => setSidebarMode(sidebarMode === 'peek' ? 'expanded' : 'peek')}
        >
          <UiIcon
            icon="chevron-right"
            size="xs"
            className={sidebarMode === 'peek' ? undefined : 'ui-icon-mirror'}
          />
        </button>
        <button type="button" className="nav-item settings-btn" inert={menuHidden} onClick={openSettings}>
          <UiIcon icon="settings" size="md" />
          Настройки
        </button>
      </div>
    </aside>
  )
}
