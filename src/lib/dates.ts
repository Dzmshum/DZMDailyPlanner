import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  addDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from 'date-fns'
import { ru } from 'date-fns/locale'

export { ru }

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDate(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDate(date) : date
  return format(d, 'd MMMM yyyy', { locale: ru })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDate(date) : date
  return format(d, 'd MMM', { locale: ru })
}

export function formatWeekday(date: Date | string): string {
  const d = typeof date === 'string' ? parseDate(date) : date
  return format(d, 'EEEE', { locale: ru })
}

export function formatWeekdayShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseDate(date) : date
  return format(d, 'EEE', { locale: ru })
}

export function today(): Date {
  return startOfDay(new Date())
}

export function isOverdue(deadline: string): boolean {
  return isBefore(parseDate(deadline), today())
}

export function isToday(deadline: string): boolean {
  return isSameDay(parseDate(deadline), today())
}

export function isUpcoming(deadline: string, days = 7): boolean {
  const d = parseDate(deadline)
  const end = addDays(today(), days)
  return (
    (isAfter(d, today()) || isSameDay(d, today())) &&
    (isBefore(d, end) || isSameDay(d, end))
  )
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isInWeek(date: Date, anchor: Date): boolean {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  return isWithinInterval(date, { start, end })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'LLLL yyyy', { locale: ru })
}

export function formatQuarterYear(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1
  return `${q} кв. ${format(date, 'yyyy')}`
}

export function getMonthDays(anchor: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(anchor),
    end: endOfMonth(anchor),
  })
}

export function getQuarterMonths(anchor: Date): Date[] {
  return eachMonthOfInterval({
    start: startOfQuarter(anchor),
    end: endOfQuarter(anchor),
  })
}

export function getYearMonths(anchor: Date): Date[] {
  return eachMonthOfInterval({
    start: startOfYear(anchor),
    end: endOfYear(anchor),
  })
}

export function formatWeekRange(anchor: Date): string {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = endOfWeek(anchor, { weekStartsOn: 1 })
  return `${format(start, 'd MMM', { locale: ru })} — ${format(end, 'd MMM yyyy', { locale: ru })}`
}
