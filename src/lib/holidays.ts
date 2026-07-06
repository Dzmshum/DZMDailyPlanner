import holidays2025 from '../data/holidays-ru-2025.json'
import holidays2026 from '../data/holidays-ru-2026.json'
import holidays2027 from '../data/holidays-ru-2027.json'
import { formatDate, parseDate } from './dates'
import { buildStatutoryFallbackCalendar } from './holidayFallback'

export interface HolidayEntry {
  date: string
  name: string
}

export interface HolidayPeriod {
  from: string
  to: string
  label: string
}

export interface HolidayCalendar {
  year: number
  holidays: HolidayEntry[]
  periods?: HolidayPeriod[]
  nonWorking: string[]
  workingOverrides: string[]
  /** true — без переносов ПП, только ст. 112 ТК РФ */
  approximate?: boolean
}

const OFFICIAL_CALENDARS: Record<number, HolidayCalendar> = {
  2025: holidays2025 as HolidayCalendar,
  2026: holidays2026 as HolidayCalendar,
  2027: holidays2027 as HolidayCalendar,
}

const FALLBACK_CACHE = new Map<number, HolidayCalendar>()

const NAMED_BY_DATE = new Map<string, HolidayEntry>()
for (const cal of Object.values(OFFICIAL_CALENDARS)) {
  for (const h of cal.holidays) {
    NAMED_BY_DATE.set(h.date, h)
  }
}

function resolveCalendar(year: number): HolidayCalendar | null {
  if (year in OFFICIAL_CALENDARS) return OFFICIAL_CALENDARS[year]
  if (year < 1990 || year > 2100) return null
  let cached = FALLBACK_CACHE.get(year)
  if (!cached) {
    cached = buildStatutoryFallbackCalendar(year) as HolidayCalendar
    FALLBACK_CACHE.set(year, cached)
  }
  return cached
}

function namedHolidayForDate(ds: string): HolidayEntry | null {
  const named = NAMED_BY_DATE.get(ds)
  if (named) return named
  const year = Number(ds.slice(0, 4))
  const cal = resolveCalendar(year)
  if (!cal) return null
  return cal.holidays.find((h) => h.date === ds) ?? null
}

const HOLIDAY_SHORT_LABELS: Record<string, string> = {
  'Новогодние каникулы': 'Каникулы',
  'Нерабочий день': 'Отдых',
  'День России': 'День РФ',
  'День знаний': '1 сент.',
  'Перенос с 03.01': 'Перенос',
  'Перенос с 04.01': 'Перенос',
  'Перенос с 05.01': 'Перенос',
  'Перенос с 23.02': 'Перенос',
  'Перенос с 08.03': 'Перенос',
  'Перенос с 01.11': 'Перенос',
  'Перенос с 02.01': 'Перенос',
  'Перенос с 20.02': 'Перенос',
}

export function getHolidayCalendar(year: number): HolidayCalendar | null {
  return resolveCalendar(year)
}

/** Календари соседних лет — для новогодних каникул на стыке годов */
function getCalendarsForDate(date: Date): HolidayCalendar[] {
  const y = date.getFullYear()
  return [y - 1, y, y + 1]
    .map(resolveCalendar)
    .filter((c): c is HolidayCalendar => c !== null)
}

function isInList(cal: HolidayCalendar, list: 'nonWorking' | 'workingOverrides', ds: string): boolean {
  return cal[list].includes(ds)
}

function getPeriodLabelForDate(d: Date): string | null {
  const ds = formatDate(d)
  for (const cal of getCalendarsForDate(d)) {
    for (const period of cal.periods ?? []) {
      if (ds >= period.from && ds <= period.to) return period.label
    }
  }
  return null
}

export function getHolidayForDate(date: Date | string): HolidayEntry | null {
  const d = typeof date === 'string' ? parseDate(date) : date
  const ds = formatDate(d)

  const named = namedHolidayForDate(ds)
  if (named) return named

  if (!isNonWorkingDay(d)) return null

  const periodLabel = getPeriodLabelForDate(d)
  if (periodLabel) return { date: ds, name: periodLabel }

  const dow = d.getDay()
  if (dow === 0 || dow === 6) return null

  return { date: ds, name: 'Нерабочий день' }
}

/** Короткая подпись для ячейки календаря */
export function formatHolidayShort(_date: Date | string, holiday: HolidayEntry): string {
  const mapped = HOLIDAY_SHORT_LABELS[holiday.name]
  if (mapped) return mapped
  if (holiday.name.length <= 14) return holiday.name
  return holiday.name.slice(0, 13) + '…'
}

/** Памятная дата в рабочий день (например, 1 сентября) */
export function isCommemorativeHoliday(date: Date | string, holiday: HolidayEntry | null): boolean {
  if (!holiday) return false
  return !isNonWorkingDay(date)
}

/**
 * Рабочий день по производственному календарю РФ (пятидневка).
 * Учитывает переносы ПП Правительства и стыки годов (каникулы 29.12–11.01).
 */
export function isWorkingDay(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseDate(date) : date
  const ds = formatDate(d)

  for (const cal of getCalendarsForDate(d)) {
    if (isInList(cal, 'workingOverrides', ds)) return true
  }

  for (const cal of getCalendarsForDate(d)) {
    if (isInList(cal, 'nonWorking', ds)) return false
  }

  const dow = d.getDay()
  return dow !== 0 && dow !== 6
}

export function isNonWorkingDay(date: Date | string): boolean {
  return !isWorkingDay(date)
}

export function hasProductionCalendar(year: number): boolean {
  return year in OFFICIAL_CALENDARS && !OFFICIAL_CALENDARS[year].approximate
}

/** Есть ли данные для подписей и нерабочих дней (официальные или приблизительные) */
export function hasHolidayData(year: number): boolean {
  return resolveCalendar(year) !== null
}

export function isApproximateHolidayYear(year: number): boolean {
  const cal = resolveCalendar(year)
  return cal?.approximate === true
}

/** Сколько дней в году получают подпись в UI (для тестов) */
export function countHolidayLabelsInYear(year: number): number {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  let count = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (getHolidayForDate(d)) count++
  }
  return count
}
