import type { ViewId } from '../types'

export interface NavEntry {
  id: 'today' | 'calendar' | 'tasks' | 'daily' | 'projects' | 'history'
  label: string
  views: readonly ViewId[]
  defaultView: ViewId
}

/** Верхний уровень сайдбара. Вложенные view остаются в plan.json и открываются переключателем. */
export const NAV_ENTRIES: readonly NavEntry[] = [
  { id: 'today', label: 'Сегодня', views: ['dashboard', 'agenda'], defaultView: 'dashboard' },
  { id: 'calendar', label: 'Календарь', views: ['week'], defaultView: 'week' },
  { id: 'tasks', label: 'Задачи', views: ['tasks', 'inbox'], defaultView: 'tasks' },
  { id: 'daily', label: 'Дейлик', views: ['daily'], defaultView: 'daily' },
  { id: 'projects', label: 'Проекты', views: ['projects'], defaultView: 'projects' },
  { id: 'history', label: 'История', views: ['history'], defaultView: 'history' },
]

/** Куда ведут клавиши 1–N. */
export const NAV_VIEW_ORDER: readonly ViewId[] = NAV_ENTRIES.map((entry) => entry.defaultView)

export const NAV_MODE_LABELS: Partial<Record<ViewId, string>> = {
  dashboard: 'Обзор',
  agenda: 'День',
  tasks: 'Список',
  inbox: 'Входящие',
}

const lastViewByEntry = new Map<NavEntry['id'], ViewId>()

export function navEntryForView(view: ViewId): NavEntry | undefined {
  return NAV_ENTRIES.find((entry) => entry.views.includes(view))
}

export function rememberNavView(view: ViewId): void {
  const entry = navEntryForView(view)
  if (entry) lastViewByEntry.set(entry.id, view)
}

export function viewForNavEntry(entry: NavEntry): ViewId {
  const last = lastViewByEntry.get(entry.id)
  if (last && entry.views.includes(last)) return last
  return entry.defaultView
}
