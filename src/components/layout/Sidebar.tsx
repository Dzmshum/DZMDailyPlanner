import type { ViewId } from '../../types'
import { VIEW_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { getViewCounts, getActiveProjects } from '../../lib/selectors'
import { BrandMark } from './BrandMark'
import { ViewIcon } from './ViewIcon'
import { UiIcon } from '../ui/UiIcon'

const NAV_ITEMS: ViewId[] = [
  'dashboard',
  'agenda',
  'week',
  'inbox',
  'daily',
  'tasks',
  'projects',
  'history',
]

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

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark variant="wordmark" size="lg" />
      </div>

      <nav>
        <ul className="nav-list">
          {NAV_ITEMS.map((id) => (
            <li key={id}>
              <button
                className={`nav-item ${currentView === id ? 'active' : ''}`}
                onClick={() => setView(id)}
              >
                <ViewIcon view={id} size="xs" />
                {VIEW_LABELS[id]}
                <span className={`nav-count ${counts[id] > 0 ? 'has-items' : ''}`}>
                  {counts[id]}
                </span>
              </button>
            </li>
          ))}
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
