/** Короткие подписи дней (0 = вс … 6 = сб), как в Date.getDay() */
export const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] as const

/** Порядок чипов в UI: понедельник → воскресенье */
export const WEEKDAY_CHIP_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export function normalizeDailyDays(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [1, 4]
  const days = [
    ...new Set(
      raw.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6),
    ),
  ].sort((a, b) => a - b)
  return days.length > 0 ? days : [1, 4]
}

export function formatDailyDaysLabel(days: number[]): string {
  const sorted = normalizeDailyDays(days)
  const key = sorted.join(',')
  if (key === '1,2,3,4,5') return 'Пн–Пт'
  if (key === '1,2,3,4,5,6,0') return 'Пн–Вс'
  if (key === '1,4') return 'Пн, Чт'
  if (sorted.length === 1) return WEEKDAY_SHORT[sorted[0]!]!
  return sorted.map((d) => WEEKDAY_SHORT[d]!).join(', ')
}

export function dailyDaysEqual(a: number[], b: number[]): boolean {
  const na = normalizeDailyDays(a)
  const nb = normalizeDailyDays(b)
  return na.length === nb.length && na.every((d, i) => d === nb[i])
}
