import type { Priority, Project, Task, ViewId } from '../types'
import { isAfter, isBefore, isSameDay, addDays } from 'date-fns'
import {
  isOverdue,
  isToday,
  isUpcoming,
  parseDate,
  isInWeek,
  today,
  formatDisplayDate,
  formatDate,
} from './dates'
import { getDoneTasksForDailyReport } from './dailyMeetings'

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function sortTasksForDay(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aHasTime = a.time ? 0 : 1
    const bHasTime = b.time ? 0 : 1
    if (aHasTime !== bHasTime) return aHasTime - bHasTime
    if (a.time && b.time) return a.time.start.localeCompare(b.time.start)
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })
}

export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== 'done')
}

export function getDoneTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.status === 'done')
    .sort((a, b) => {
      const aDate = a.completedAt ?? a.createdAt
      const bDate = b.completedAt ?? b.createdAt
      return bDate.localeCompare(aDate)
    })
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  return getActiveTasks(tasks)
    .filter((t) => t.deadline && isOverdue(t.deadline))
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
}

export function getTodayTasks(tasks: Task[]): Task[] {
  return sortTasksForDay(
    getActiveTasks(tasks).filter((t) => t.deadline && isToday(t.deadline)),
  )
}

export function getUpcomingTasks(tasks: Task[], days = 7): Task[] {
  return getActiveTasks(tasks)
    .filter((t) => {
      if (!t.deadline) return false
      if (isOverdue(t.deadline) || isToday(t.deadline)) return false
      return isUpcoming(t.deadline, days)
    })
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
}

export function getDoneTodayTasks(tasks: Task[]): Task[] {
  return sortTasksForDay(getDoneTasksForDay(tasks, new Date()))
}

export function getDoneUpcomingTasks(tasks: Task[], days = 7): Task[] {
  return getDoneTasks(tasks)
    .filter((t) => {
      if (!t.deadline) return false
      if (isOverdue(t.deadline) || isToday(t.deadline)) return false
      return isUpcoming(t.deadline, days)
    })
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
}

export function getTasksForDay(tasks: Task[], date: Date): Task[] {
  return sortTasksForDay(
    getActiveTasks(tasks).filter(
      (t) => t.deadline && isSameDaySafe(t.deadline, date),
    ),
  )
}

export function getDoneTasksForDay(tasks: Task[], date: Date): Task[] {
  return getDoneTasks(tasks).filter(
    (t) => t.deadline && isSameDaySafe(t.deadline, date),
  )
}

function isSameDaySafe(deadline: string, date: Date): boolean {
  const d = parseDate(deadline)
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  )
}

export function groupTasksByProject(
  tasks: Task[],
  projects: Project[],
): { project: Project | null; tasks: Task[] }[] {
  const groups = new Map<string | null, Task[]>()

  for (const task of tasks) {
    const key = task.projectId
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(task)
  }

  const result: { project: Project | null; tasks: Task[] }[] = []

  for (const project of projects) {
    const projectTasks = groups.get(project.id)
    if (projectTasks?.length) {
      result.push({ project, tasks: projectTasks })
      groups.delete(project.id)
    }
  }

  const noProject = groups.get(null)
  if (noProject?.length) {
    result.push({ project: null, tasks: noProject })
  }

  for (const [id, projectTasks] of groups) {
    if (id && projectTasks.length) {
      const project = projects.find((p) => p.id === id) ?? null
      result.push({ project, tasks: projectTasks })
    }
  }

  return result
}

export function getProjectById(
  projects: Project[],
  id: string | null,
): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}

export function isProjectActive(project: Project): boolean {
  return !project.completed
}

export function getActiveProjects(projects: Project[]): Project[] {
  return projects.filter(isProjectActive)
}

/** Список для выбора проекта: активные; завершённые — только при поиске или если уже выбран */
export function filterProjectsForSelect(
  projects: Project[],
  query: string,
  selectedId: string | null,
): Project[] {
  const q = query.trim().toLowerCase()
  const selected = selectedId ? projects.find((p) => p.id === selectedId) : undefined

  let list = q
    ? projects.filter((p) => p.name.toLowerCase().includes(q))
    : projects.filter((p) => !p.completed)

  if (selected && !list.some((p) => p.id === selected.id)) {
    list = [selected, ...list]
  }

  return list
}

export function getInboxTasks(tasks: Task[]): Task[] {
  return getActiveTasks(tasks)
    .filter((t) => !t.deadline)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getTasksWithDeadlineInRange(
  tasks: Task[],
  start: Date,
  end: Date,
  includeDone = false,
): Task[] {
  const pool = includeDone ? tasks : getActiveTasks(tasks)
  return pool
    .filter((t) => {
      if (!t.deadline) return false
      const d = parseDate(t.deadline)
      return (
        (isAfter(d, start) || isSameDay(d, start)) &&
        (isBefore(d, end) || isSameDay(d, end))
      )
    })
    .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
}

export function countTasksOnDay(tasks: Task[], date: Date): number {
  return getActiveTasks(tasks).filter(
    (t) => t.deadline && isSameDaySafe(t.deadline, date),
  ).length
}

export const MONTH_CELL_TASK_PREVIEW_LIMIT = 4

export interface MonthCellTaskItem {
  task: Task
  done: boolean
}

export interface MonthCellTaskPreview {
  items: MonthCellTaskItem[]
  overflow: number
  total: number
}

/** Превью задач в ячейке месячного календаря: сначала активные, затем выполненные */
export function getMonthCellTaskPreview(
  tasks: Task[],
  day: Date,
  limit = MONTH_CELL_TASK_PREVIEW_LIMIT,
): MonthCellTaskPreview {
  const active = getTasksForDay(tasks, day)
  const done = getDoneTasksForDay(tasks, day)
  const all: MonthCellTaskItem[] = [
    ...active.map((task) => ({ task, done: false })),
    ...done.map((task) => ({ task, done: true })),
  ]
  return {
    items: all.slice(0, limit),
    overflow: Math.max(0, all.length - limit),
    total: all.length,
  }
}

export interface DoneTasksDayGroup {
  date: string
  label: string
  tasks: Task[]
}

export function getDoneTasksGroupedByDate(tasks: Task[]): DoneTasksDayGroup[] {
  const done = getDoneTasks(tasks)
  const groups = new Map<string, Task[]>()

  for (const task of done) {
    const raw = task.completedAt ?? task.createdAt
    const dayKey = raw.slice(0, 10)
    if (!groups.has(dayKey)) groups.set(dayKey, [])
    groups.get(dayKey)!.push(task)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayTasks]) => ({
      date,
      label: formatHistoryGroupLabel(date),
      tasks: dayTasks.sort((a, b) => {
        const aT = a.completedAt ?? a.createdAt
        const bT = b.completedAt ?? b.createdAt
        return bT.localeCompare(aT)
      }),
    }))
}

function formatHistoryGroupLabel(dateStr: string): string {
  const nowStr = formatDate(today())
  if (dateStr === nowStr) return 'Сегодня'
  if (dateStr === formatDate(addDays(today(), -1))) return 'Вчера'
  return formatDisplayDate(dateStr)
}

export function getViewCounts(
  tasks: Task[],
  agendaDate: string,
  weekAnchor: string,
  dailyDays: number[] = [1, 4],
  projectCount = 0,
): Record<ViewId, number> {
  const overdue = getOverdueTasks(tasks)
  const todayTasks = getTodayTasks(tasks)
  const upcoming = getUpcomingTasks(tasks)
  const dashboardIds = new Set(
    [...overdue, ...todayTasks, ...upcoming].map((t) => t.id),
  )

  const agenda = getTasksForDay(tasks, parseDate(agendaDate))
  const active = getActiveTasks(tasks)
  const weekTasks = active.filter(
    (t) => t.deadline && isInWeek(parseDate(t.deadline), parseDate(weekAnchor)),
  )

  return {
    dashboard: dashboardIds.size,
    agenda: agenda.length,
    week: weekTasks.length,
    tasks: active.length,
    history: getDoneTasks(tasks).length,
    inbox: getInboxTasks(tasks).length,
    daily: getDoneTasksForDailyReport(tasks, dailyDays).length,
    projects: projectCount,
  }
}
