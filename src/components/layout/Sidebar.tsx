import { useEffect, useRef, useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getViewCounts, getActiveProjects } from '../../lib/selectors'
import { NAV_ENTRIES, rememberNavView, viewForNavEntry } from '../../lib/nav'
import { BrandMark } from './BrandMark'
import { ViewIcon } from './ViewIcon'
import { UiIcon } from '../ui/UiIcon'
import { SidebarRadialMenu } from './SidebarRadialMenu'

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
  const toggleSidebarMode = usePlanStore((s) => s.toggleSidebarMode)
  const [revealed, setRevealed] = useState(false)
  const [radialOpen, setRadialOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hovering = useRef(false)
  const logoRef = useRef<HTMLButtonElement>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const reveal = () => {
    hovering.current = true
    if (sidebarMode !== 'peek') return
    clearCloseTimer()
    setRevealed(true)
  }

  const scheduleHide = () => {
    hovering.current = false
    if (sidebarMode !== 'peek' || radialOpen) return
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setRevealed(false), 400)
  }

  const closeRadial = () => {
    setRadialOpen(false)
    logoRef.current?.focus()
    if (sidebarMode === 'peek' && !hovering.current) {
      clearCloseTimer()
      closeTimer.current = setTimeout(() => setRevealed(false), 400)
    }
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
    setRadialOpen(false)
  }, [currentView])

  useEffect(() => {
    if (sidebarMode !== 'peek') {
      clearCloseTimer()
      setRevealed(false)
    }
    setRadialOpen(false)
  }, [sidebarMode])

  useEffect(() => () => clearCloseTimer(), [])

  const menuHidden = sidebarMode === 'peek' && !revealed
  const toggleLabel =
    sidebarMode === 'peek' ? 'Полное меню' : sidebarMode === 'rail' ? 'Скрыть меню' : 'Меню из иконок'

  return (
    <aside
      className={`sidebar titlebar-no-drag${revealed ? ' sidebar--open' : ''}`}
      onMouseEnter={reveal}
      onMouseLeave={scheduleHide}
    >
      <div className="sidebar-brand" inert={menuHidden}>
        <button
          ref={logoRef}
          type="button"
          className="sidebar-logo"
          aria-label="Разделы"
          aria-haspopup="menu"
          aria-expanded={radialOpen}
          aria-controls="sidebar-radial-menu"
          title="Разделы"
          onClick={() => {
            if (radialOpen) {
              closeRadial()
              return
            }
            clearCloseTimer()
            setRadialOpen(true)
          }}
        >
          {sidebarMode === 'rail' ? (
            <BrandMark variant="icon" size="sm" />
          ) : (
            <BrandMark variant="wordmark" size="lg" />
          )}
        </button>
      </div>

      <SidebarRadialMenu
        open={radialOpen && !menuHidden}
        compact={sidebarMode === 'rail'}
        anchorRef={logoRef}
        onClose={closeRadial}
      />

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
                  title={sidebarMode === 'rail' ? entry.label : undefined}
                  onClick={() => {
                    if (active) return
                    setView(viewForNavEntry(entry))
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <ViewIcon view={iconView} size="xs" />
                  <span className="nav-label">{entry.label}</span>
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
          aria-label={toggleLabel}
          title={`${toggleLabel} ([)`}
          onClick={toggleSidebarMode}
        >
          <UiIcon
            icon="chevron-right"
            size="xs"
            className={sidebarMode === 'peek' ? undefined : 'ui-icon-mirror'}
          />
        </button>
        <button
          type="button"
          className="nav-item settings-btn"
          inert={menuHidden}
          title={sidebarMode === 'rail' ? 'Настройки' : undefined}
          onClick={openSettings}
        >
          <UiIcon icon="settings" size="md" />
          <span className="nav-label">Настройки</span>
        </button>
      </div>
    </aside>
  )
}
