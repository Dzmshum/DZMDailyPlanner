import {
  addDays,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns'
import type { PlanData, Task } from '../types'
import { parseDate } from './dates'
import { getActiveTasks, getTasksForDay } from './selectors'

export type ExportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface ExportTextOptions {
  period: ExportPeriod
  anchorDate: Date
  includeDone?: boolean
  skipEmptyDays?: boolean
  title?: string
}

function formatTelegramDate(d: Date): string {
  return format(d, 'dd/MM')
}

function tasksOnDay(tasks: Task[], day: Date, includeDone: boolean): Task[] {
  const active = getTasksForDay(tasks, day)
  if (!includeDone) return active

  const done = tasks.filter((t) => {
    if (t.status !== 'done' || !t.deadline) return false
    const dl = parseDate(t.deadline)
    return isSameDay(dl, day)
  })
  return [...active, ...done]
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

export function exportPlanText(data: PlanData, options: ExportTextOptions): string {
  const {
    period,
    anchorDate,
    includeDone = false,
    skipEmptyDays = true,
    title = 'Текущий план.',
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

  const inbox = inboxTasks(data.tasks, includeDone)
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
  return dateStr.length === 10 ? parseDate(dateStr) : parseISO(dateStr)
}
