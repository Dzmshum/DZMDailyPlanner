import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getViewCounts, getActiveProjects } from '../../lib/selectors'
import { NAV_ENTRIES, rememberNavView, viewForNavEntry } from '../../lib/nav'
import { radialHeaderPad } from '../../lib/radialMenu'
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
  const [radialOpen, setRadialOpen] = useState(false)
  const logoRef = useRef<HTMLButtonElement>(null)
  const radialMode = sidebarMode === 'radial'

  const closeRadial = () => {
    setRadialOpen(false)
    logoRef.current?.focus()
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
  }, [currentView, sidebarMode])

  useLayoutEffect(() => {
    const layoutEl = document.querySelector<HTMLElement>('.app-layout')
    if (!radialMode) {
      layoutEl?.style.removeProperty('--radial-header-pad')
      return
    }

    const measure = () => {
      const anchor = logoRef.current
      if (!anchor || !layoutEl) return
      const originX = anchor.getBoundingClientRect().left + anchor.offsetWidth
      layoutEl.style.setProperty('--radial-header-pad', `${radialHeaderPad(originX)}px`)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      layoutEl?.style.removeProperty('--radial-header-pad')
    }
  }, [radialMode])

  const toggleLabel = radialMode ? 'Полное меню' : 'Круговое меню'

  return (
    <aside className="sidebar titlebar-no-drag">
      <div className="sidebar-brand">
        {radialMode ? (
          <button
            ref={logoRef}
            type="button"
            className="sidebar-logo titlebar-no-drag"
            aria-label="Разделы"
            aria-haspopup="menu"
            aria-expanded={radialOpen}
            aria-controls="sidebar-radial-menu"
            title="Разделы"
            onClick={() => {
              if (radialOpen) closeRadial()
              else setRadialOpen(true)
            }}
          >
            <BrandMark variant="icon" size="md" />
          </button>
        ) : (
          <div className="sidebar-logo titlebar-no-drag">
            <BrandMark variant="wordmark" size="lg" />
          </div>
        )}
      </div>

      <SidebarRadialMenu
        open={radialMode && radialOpen}
        anchorRef={logoRef}
        onClose={closeRadial}
        onOpenSettings={openSettings}
      />

      {radialMode ? null : (
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
                    <span className="nav-label">{entry.label}</span>
                    <span className={`nav-count ${count > 0 ? 'has-items' : ''}`}>
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
            <li>
              <button type="button" className="nav-item settings-btn" onClick={openSettings}>
                <UiIcon icon="settings" size="md" />
                <span className="nav-label">Настройки</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

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
            className={radialMode ? undefined : 'ui-icon-mirror'}
          />
        </button>
      </div>
    </aside>
  )
}
