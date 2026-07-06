export interface FallbackHolidayEntry {
  date: string
  name: string
}

export interface FallbackHolidayPeriod {
  from: string
  to: string
  label: string
}

export interface FallbackHolidayCalendar {
  year: number
  holidays: FallbackHolidayEntry[]
  periods?: FallbackHolidayPeriod[]
  nonWorking: string[]
  workingOverrides: string[]
  approximate?: boolean
}

/** Фиксированные праздники ТК РФ (ст. 112) без переносов Правительства */
const STATUTORY_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: 'Новый год' },
  { month: 1, day: 7, name: 'Рождество' },
  { month: 2, day: 23, name: '23 февраля' },
  { month: 3, day: 8, name: '8 марта' },
  { month: 5, day: 1, name: '1 мая' },
  { month: 5, day: 9, name: '9 мая' },
  { month: 6, day: 12, name: 'День России' },
  { month: 9, day: 1, name: 'День знаний' },
  { month: 11, day: 4, name: '4 ноября' },
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function eachDateInclusive(fromStr: string, toStr: string): string[] {
  const out: string[] = []
  const [fy, fm, fd] = fromStr.split('-').map(Number)
  const [ty, tm, td] = toStr.split('-').map(Number)
  const cur = new Date(fy, fm - 1, fd)
  const end = new Date(ty, tm - 1, td)
  while (cur <= end) {
    out.push(dateStr(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/**
 * Приблизительный календарь для годов без утверждённого ПП:
 * выходные + нерабочие 1–8 января + даты из ст. 112 ТК РФ (без переносов).
 */
export function buildStatutoryFallbackCalendar(year: number): FallbackHolidayCalendar {
  const holidays: FallbackHolidayEntry[] = STATUTORY_HOLIDAYS.map((h) => ({
    date: dateStr(year, h.month, h.day),
    name: h.name,
  }))

  const periods: FallbackHolidayPeriod[] = [
    { from: dateStr(year, 1, 1), to: dateStr(year, 1, 8), label: 'Новогодние каникулы' },
  ]

  const nonWorking = new Set<string>()
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = dateStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const dow = d.getDay()
    if (dow === 0 || dow === 6) nonWorking.add(ds)
  }

  for (const ds of eachDateInclusive(dateStr(year, 1, 1), dateStr(year, 1, 8))) {
    nonWorking.add(ds)
  }

  for (const h of STATUTORY_HOLIDAYS) {
    if (h.month === 1 && h.day <= 8) continue
    if (h.month === 9 && h.day === 1) continue
    nonWorking.add(dateStr(year, h.month, h.day))
  }

  return {
    year,
    holidays,
    periods,
    nonWorking: [...nonWorking].sort(),
    workingOverrides: [],
    approximate: true,
  }
}
