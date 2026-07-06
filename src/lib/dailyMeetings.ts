import { addDays, isBefore, isSameDay, startOfDay } from 'date-fns'
import type { Task } from '../types'
import { formatDate, parseDate } from './dates'
import { isWorkingDay } from './holidays'

const DEFAULT_DAILY_DOW = [1, 4] // Mon, Thu

/** Закрытие дня для дейлика: до 13:00 включительно — текущий период, после — следующий */
export const DAILY_CUTOFF_HOUR = 13

export function isAfterDailyCutoff(date: Date): boolean {
  const cutoff = new Date(date)
  cutoff.setHours(DAILY_CUTOFF_HOUR, 0, 0, 0)
  return date.getTime() > cutoff.getTime()
}

export function isDailyMeetingDay(
  date: Date | string,
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): boolean {
  const d = typeof date === 'string' ? parseDate(date) : date
  if (!isWorkingDay(d)) return false
  const dow = d.getDay()
  return dailyDays.includes(dow)
}

function findDailyMeeting(
  from: Date,
  direction: -1 | 1,
  dailyDays: number[],
  maxDays = 366,
): Date | null {
  let cursor = startOfDay(from)
  for (let i = 0; i < maxDays; i++) {
    if (direction === -1) cursor = addDays(cursor, -1)
    else cursor = addDays(cursor, 1)

    if (isDailyMeetingDay(cursor, dailyDays)) return cursor
  }
  return null
}

export function getPreviousDailyMeeting(
  from: Date = new Date(),
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): Date | null {
  return findDailyMeeting(startOfDay(from), -1, dailyDays)
}

export function getNextDailyMeeting(
  from: Date = new Date(),
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): Date | null {
  return findDailyMeeting(startOfDay(from), 1, dailyDays)
}

/**
 * Ближайший предстоящий дейлик для отчёта.
 * Если сегодня день дейлика — до 13:00 готовимся к сегодняшнему созвону,
 * после 13:00 — уже к следующему пн/чт.
 * Иначе — к следующему рабочему пн/чт.
 */
export function getTargetDailyMeeting(
  from: Date = new Date(),
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): Date | null {
  const today = startOfDay(from)
  if (isDailyMeetingDay(today, dailyDays)) {
    if (isAfterDailyCutoff(from)) return getNextDailyMeeting(today, dailyDays)
    return today
  }
  return getNextDailyMeeting(today, dailyDays)
}

export interface DailyReportPeriod {
  targetDaily: Date | null
  previousDaily: Date | null
  /** Первый день включительно (для подписи в UI) */
  periodStart: Date | null
  /** Последний день включительно — всегда день перед targetDaily */
  periodEnd: Date | null
}

export function getDailyReportPeriodForTarget(
  targetDaily: Date,
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): DailyReportPeriod {
  const target = startOfDay(targetDaily)
  const previousDaily = findDailyMeeting(target, -1, dailyDays)
  const periodEnd = addDays(target, -1)

  let periodStart: Date | null = null
  if (previousDaily) {
    periodStart = addDays(startOfDay(previousDaily), 1)
    if (isDailyMeetingDay(previousDaily, dailyDays)) {
      periodStart = startOfDay(previousDaily)
    }
  }

  if (periodStart && isAfterDay(periodStart, periodEnd)) {
    return { targetDaily: target, previousDaily, periodStart: null, periodEnd: null }
  }

  return { targetDaily: target, previousDaily, periodStart, periodEnd }
}

export function getDailyReportPeriod(
  dailyDays: number[] = DEFAULT_DAILY_DOW,
  now: Date = new Date(),
): DailyReportPeriod {
  const targetDaily = getTargetDailyMeeting(now, dailyDays)
  if (!targetDaily) {
    return { targetDaily: null, previousDaily: null, periodStart: null, periodEnd: null }
  }
  return getDailyReportPeriodForTarget(targetDaily, dailyDays)
}

/** Прошлые дейлики (без текущего актуального target) */
export function getPastDailyMeetings(
  now: Date = new Date(),
  dailyDays: number[] = DEFAULT_DAILY_DOW,
  limit = 12,
): Date[] {
  const current = getTargetDailyMeeting(now, dailyDays)
  if (!current) return []

  const meetings: Date[] = []
  let cursor = current
  for (let i = 0; i < limit; i++) {
    const prev = getPreviousDailyMeeting(cursor, dailyDays)
    if (!prev) break
    meetings.push(prev)
    cursor = prev
  }
  return meetings
}

function isAfterDay(a: Date, b: Date): boolean {
  return isBefore(startOfDay(b), startOfDay(a)) && !isSameDay(a, b)
}

/**
 * Попадает ли момент завершения в отчёт для targetDaily.
 *
 * Правила:
 * 1. День самого дейлика (targetDaily) — не входит.
 * 2. День предыдущего дейлика — входит, если это рабочий пн/чт и до 13:00 включительно.
 * 3. Между previousDaily и targetDaily — входит (середина периода без ограничения по часу).
 * 4. День перед дейликом (periodEnd) — до 13:00 включительно, после — следующий дейлик.
 * 5. До previousDaily — не входит.
 */
export function isCompletedForDailyReport(
  completed: Date,
  targetDaily: Date,
  previousDaily: Date | null,
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): boolean {
  const completedDay = startOfDay(completed)
  const target = startOfDay(targetDaily)
  const periodEnd = addDays(target, -1)

  if (!isBefore(completedDay, target) && !isSameDay(completedDay, target)) return false
  if (isSameDay(completedDay, target)) return false

  if (isSameDay(completedDay, periodEnd) && isAfterDailyCutoff(completed)) return false

  if (!previousDaily) {
    return !isAfterDay(completedDay, periodEnd)
  }

  const prev = startOfDay(previousDaily)

  // Закрыто после 13:00 в день перед прошлым дейликом — перенос на этот отчёт
  const carryOverDay = addDays(prev, -1)
  if (isSameDay(completedDay, carryOverDay) && isAfterDailyCutoff(completed)) {
    return true
  }

  if (isBefore(completedDay, prev)) return false

  if (isSameDay(completedDay, prev)) {
    if (!isDailyMeetingDay(prev, dailyDays)) return false
    // Весь день прошлого дейлика идёт в этот отчёт (до и после 13:00)
    return true
  }

  if (isAfterDay(completedDay, periodEnd)) return false

  return true
}

function sortDoneTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.completedAt ?? a.createdAt
    const bDate = b.completedAt ?? b.createdAt
    return bDate.localeCompare(aDate)
  })
}

function filterDoneTasksForTarget(
  tasks: Task[],
  targetDaily: Date,
  previousDaily: Date | null,
  dailyDays: number[],
): Task[] {
  return sortDoneTasks(
    tasks.filter((t) => {
      if (t.status !== 'done') return false
      const completed = parseDate(t.completedAt ?? t.createdAt)
      return isCompletedForDailyReport(completed, targetDaily, previousDaily, dailyDays)
    }),
  )
}

/** Закрыто в последний день периода после 13:00 — перенос на следующий дейлик */
export function getPeriodEndDeferredTasks(
  tasks: Task[],
  targetDaily: Date,
): Task[] {
  const periodEnd = addDays(startOfDay(targetDaily), -1)

  return sortDoneTasks(
    tasks.filter((t) => {
      if (t.status !== 'done') return false
      const completed = parseDate(t.completedAt ?? t.createdAt)
      return isSameDay(startOfDay(completed), periodEnd) && isAfterDailyCutoff(completed)
    }),
  )
}

/** Выполненные к конкретному дейлику */
export function getDoneTasksForTargetDaily(
  tasks: Task[],
  targetDaily: Date,
  dailyDays: number[] = DEFAULT_DAILY_DOW,
): Task[] {
  const { previousDaily } = getDailyReportPeriodForTarget(targetDaily, dailyDays)
  return filterDoneTasksForTarget(tasks, targetDaily, previousDaily, dailyDays)
}

/** Выполненные к ближайшему дейлику (не включая день самого дейлика) */
export function getDoneTasksForDailyReport(
  tasks: Task[],
  dailyDays: number[] = DEFAULT_DAILY_DOW,
  now: Date = new Date(),
): Task[] {
  const { targetDaily, previousDaily } = getDailyReportPeriod(dailyDays, now)
  if (!targetDaily) return []
  return filterDoneTasksForTarget(tasks, targetDaily, previousDaily, dailyDays)
}

/** Активные / невыполненные задачи к этому дейлику */
export function getUndoneTasksForDailyReport(
  tasks: Task[],
  dailyDays: number[] = DEFAULT_DAILY_DOW,
  now: Date = new Date(),
  targetDailyOverride?: Date,
): Task[] {
  const { targetDaily, periodStart, periodEnd } = targetDailyOverride
    ? getDailyReportPeriodForTarget(targetDailyOverride, dailyDays)
    : getDailyReportPeriod(dailyDays, now)
  if (!targetDaily || !periodEnd) return []

  const targetStr = formatDate(targetDaily)

  return tasks
    .filter((t) => {
      if (t.status === 'done') return false

      if (!t.deadline) {
        if (!periodStart) return true
        const created = startOfDay(parseDate(t.createdAt))
        return isDateInInclusiveRange(created, periodStart, periodEnd)
      }

      if (t.deadline < targetStr) return true

      if (!periodStart) return t.deadline <= formatDate(periodEnd)

      return t.deadline >= formatDate(periodStart) && t.deadline <= formatDate(periodEnd)
    })
    .sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))
}

function isDateInInclusiveRange(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date)
  if (isBefore(d, startOfDay(start)) && !isSameDay(d, start)) return false
  if (isBefore(startOfDay(end), d) && !isSameDay(d, end)) return false
  return true
}

/** @deprecated use getDoneTasksForDailyReport */
export function getDoneTasksSinceDailyMeeting(
  tasks: Task[],
  dailyDays: number[] = DEFAULT_DAILY_DOW,
  now: Date = new Date(),
): Task[] {
  return getDoneTasksForDailyReport(tasks, dailyDays, now)
}

export function formatDailyMeetingLabel(date: Date): string {
  return formatDate(date)
}
