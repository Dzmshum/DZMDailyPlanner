import {
  addDays,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
} from 'date-fns'
import type { PlanData, Task } from '../types'
import { parseDate, today } from './dates'
import { getActiveTasks, getDoneTasksForDay, getTasksForDay } from './selectors'

export type ExportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface ExportTextOptions {
  period: ExportPeriod
  anchorDate: Date
  includeDone?: boolean
  skipEmptyDays?: boolean
  title?: string
  includeRecentDone?: boolean
  recentDoneDays?: number
  includeInbox?: boolean
}

function formatTelegramDate(d: Date): string {
  return format(d, 'dd/MM')
}

function tasksOnDay(tasks: Task[], day: Date, includeDone: boolean): Task[] {
  const active = getTasksForDay(tasks, day)
  if (!includeDone) return active
  return [...active, ...getDoneTasksForDay(tasks, day)]
}

function getPeriodRange(period: ExportPeriod, anchorDate: Date): { start: Date; end: Date } {
  switch (period) {
    case 'day':
      return { start: anchorDate, end: anchorDate }
    case 'week': {
      const dow = anchorDate.getDay()
      const monOffset = dow === 0 ? -6 : 1 - dow
      const start = addDays(anchorDate, monOffset)
      return { start, end: addDays(start, 6) }
    }
    case 'month':
      return { start: startOfMonth(anchorDate), end: endOfMonth(anchorDate) }
    case 'quarter':
      return { start: startOfQuarter(anchorDate), end: endOfQuarter(anchorDate) }
    case 'year':
      return { start: startOfYear(anchorDate), end: endOfYear(anchorDate) }
  }
}

function inboxTasks(tasks: Task[], includeDone: boolean): Task[] {
  return tasks.filter((t) => {
    if (t.deadline) return false
    if (!includeDone && t.status === 'done') return false
    return true
  })
}

function formatTaskLine(task: Task): string {
  const prefix = task.status === 'done' ? '(✓) ' : ''
  return `- ${prefix}${task.title}`
}

function getTaskCompletedDay(task: Task): Date | null {
  if (task.status !== 'done') return null
  const raw = task.completedAt ?? task.deadline
  if (!raw) return null
  return startOfDay(parseDate(raw))
}

export function getRecentlyDoneByDay(
  tasks: Task[],
  daysBack: number,
  referenceDate: Date = today(),
): Map<string, Task[]> {
  const end = startOfDay(referenceDate)
  const start = subDays(end, daysBack - 1)
  const byDay = new Map<string, Task[]>()

  for (const task of tasks) {
    const day = getTaskCompletedDay(task)
    if (!day || day < start || day > end) continue
    const key = format(day, 'yyyy-MM-dd')
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)!.push(task)
  }

  for (const dayTasks of byDay.values()) {
    dayTasks.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  }

  return byDay
}

function appendRecentDoneSection(
  lines: string[],
  tasks: Task[],
  daysBack: number,
): void {
  const byDay = getRecentlyDoneByDay(tasks, daysBack)
  if (byDay.size === 0) return

  lines.push(`Сделано за ${daysBack} дн.:`)
  const sortedKeys = [...byDay.keys()].sort((a, b) => b.localeCompare(a))
  for (const key of sortedKeys) {
    const dayTasks = byDay.get(key)!
    const titles = dayTasks.map((t) => t.title).join('; ')
    lines.push(`${formatTelegramDate(parseDate(key))}: ${titles}`)
  }
  lines.push('')
}

export function exportPlanText(data: PlanData, options: ExportTextOptions): string {
  const {
    period,
    anchorDate,
    includeDone = false,
    skipEmptyDays = true,
    title = 'Текущий план.',
    includeRecentDone = false,
    recentDoneDays = 7,
    includeInbox = false,
  } = options

  const pool = includeDone ? data.tasks : getActiveTasks(data.tasks)
  const lines: string[] = [title, '']

  const { start, end } = getPeriodRange(period, anchorDate)

  let cursor = start
  while (cursor <= end) {
    const dayTasks = tasksOnDay(pool, cursor, includeDone)
    if (dayTasks.length > 0) {
      lines.push(`${formatTelegramDate(cursor)}:`)
      for (const t of dayTasks) lines.push(formatTaskLine(t))
      lines.push('')
    } else if (!skipEmptyDays) {
      lines.push(`${formatTelegramDate(cursor)}:`)
      lines.push('- нет задач')
      lines.push('')
    }
    cursor = addDays(cursor, 1)
  }

  if (includeRecentDone) {
    appendRecentDoneSection(lines, data.tasks, recentDoneDays)
  }

  const inbox = includeInbox ? inboxTasks(data.tasks, includeDone) : []
  if (inbox.length) {
    lines.push('Без срока:')
    for (const t of inbox) lines.push(formatTaskLine(t))
    lines.push('')
  }

  while (lines.length && lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.join('\n')
}

export function parseExportAnchor(dateStr: string): Date {
  return parseDate(dateStr)
}
