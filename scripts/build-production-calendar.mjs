/**
 * Генерация holidays-ru-YYYY.json по производственному календарю РФ
 * (пятидневка, Постановления Правительства о переносах).
 *
 * Запуск: node scripts/build-production-calendar.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src/data')

/** @typedef {{ date: string, name: string }} HolidayEntry */
/** @typedef {{ from: string, to: string, label: string }} Period */

/** @type {Record<number, { workingOverrides: string[], periods: Period[], holidays: HolidayEntry[] }>} */
const RULES = {
  2025: {
    workingOverrides: ['2025-11-01'],
    periods: [
      { from: '2024-12-29', to: '2025-01-08', label: 'Новогодние каникулы' },
      { from: '2025-02-22', to: '2025-02-23', label: '23 февраля' },
      { from: '2025-03-08', to: '2025-03-09', label: '8 марта' },
      { from: '2025-05-01', to: '2025-05-04', label: '1 мая' },
      { from: '2025-05-08', to: '2025-05-11', label: '9 мая' },
      { from: '2025-06-12', to: '2025-06-15', label: 'День России' },
      { from: '2025-11-02', to: '2025-11-04', label: '4 ноября' },
      { from: '2025-12-31', to: '2025-12-31', label: 'Перенос с 05.01' },
    ],
    holidays: [
      { date: '2025-01-01', name: 'Новый год' },
      { date: '2025-01-07', name: 'Рождество' },
      { date: '2025-02-23', name: '23 февраля' },
      { date: '2025-03-08', name: '8 марта' },
      { date: '2025-05-01', name: '1 мая' },
      { date: '2025-05-09', name: '9 мая' },
      { date: '2025-06-12', name: 'День России' },
      { date: '2025-09-01', name: 'День знаний' },
      { date: '2025-11-04', name: '4 ноября' },
      { date: '2025-05-02', name: 'Перенос с 04.01' },
      { date: '2025-05-08', name: 'Перенос с 23.02' },
      { date: '2025-06-13', name: 'Перенос с 08.03' },
      { date: '2025-11-03', name: 'Перенос с 01.11' },
      { date: '2025-12-31', name: 'Перенос с 05.01' },
    ],
  },
  2026: {
    workingOverrides: [],
    periods: [
      { from: '2025-12-31', to: '2026-01-11', label: 'Новогодние каникулы' },
      { from: '2026-02-21', to: '2026-02-23', label: '23 февраля' },
      { from: '2026-03-07', to: '2026-03-09', label: '8 марта' },
      { from: '2026-05-01', to: '2026-05-03', label: '1 мая' },
      { from: '2026-05-09', to: '2026-05-11', label: '9 мая' },
      { from: '2026-06-12', to: '2026-06-14', label: 'День России' },
      { from: '2026-11-04', to: '2026-11-04', label: '4 ноября' },
      { from: '2026-12-31', to: '2026-12-31', label: 'Перенос с 04.01' },
    ],
    holidays: [
      { date: '2026-01-01', name: 'Новый год' },
      { date: '2026-01-07', name: 'Рождество' },
      { date: '2026-01-09', name: 'Перенос с 03.01' },
      { date: '2026-02-23', name: '23 февраля' },
      { date: '2026-03-08', name: '8 марта' },
      { date: '2026-05-01', name: '1 мая' },
      { date: '2026-05-09', name: '9 мая' },
      { date: '2026-06-12', name: 'День России' },
      { date: '2026-09-01', name: 'День знаний' },
      { date: '2026-11-04', name: '4 ноября' },
      { date: '2026-12-31', name: 'Перенос с 04.01' },
    ],
  },
  2027: {
    // Проект ПП «О переносе выходных дней в 2027 году» (КонсультантПлюс; до утверждения)
    workingOverrides: ['2027-02-20'],
    periods: [
      { from: '2026-12-31', to: '2027-01-10', label: 'Новогодние каникулы' },
      { from: '2027-02-21', to: '2027-02-23', label: '23 февраля' },
      { from: '2027-03-06', to: '2027-03-08', label: '8 марта' },
      { from: '2027-05-01', to: '2027-05-03', label: '1 мая' },
      { from: '2027-05-08', to: '2027-05-10', label: '9 мая' },
      { from: '2027-06-12', to: '2027-06-14', label: 'День России' },
      { from: '2027-11-04', to: '2027-11-07', label: '4 ноября' },
      { from: '2027-12-31', to: '2027-12-31', label: 'Перенос с 03.01' },
    ],
    holidays: [
      { date: '2027-01-01', name: 'Новый год' },
      { date: '2027-01-07', name: 'Рождество' },
      { date: '2027-02-22', name: 'Перенос с 20.02' },
      { date: '2027-02-23', name: '23 февраля' },
      { date: '2027-03-08', name: '8 марта' },
      { date: '2027-05-01', name: '1 мая' },
      { date: '2027-05-09', name: '9 мая' },
      { date: '2027-06-12', name: 'День России' },
      { date: '2027-09-01', name: 'День знаний' },
      { date: '2027-11-04', name: '4 ноября' },
      { date: '2027-11-05', name: 'Перенос с 02.01' },
      { date: '2027-12-31', name: 'Перенос с 03.01' },
    ],
  },
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function eachDateInclusive(fromStr, toStr) {
  const out = []
  const cur = parseDate(fromStr)
  const end = parseDate(toStr)
  while (cur <= end) {
    out.push(formatDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

function buildCalendarYear(year, rules) {
  const nonWorking = new Set()
  const workingOverrides = new Set(rules.workingOverrides)

  // Все субботы и воскресенья года
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    const ds = formatDate(d)
    if ((dow === 0 || dow === 6) && !workingOverrides.has(ds)) {
      nonWorking.add(ds)
    }
  }

  // Праздничные периоды (могут захватывать соседний год)
  for (const period of rules.periods) {
    for (const ds of eachDateInclusive(period.from, period.to)) {
      if (!workingOverrides.has(ds)) nonWorking.add(ds)
    }
  }

  const nonWorkingList = [...nonWorking].sort()
  const workingDays = countWorkingDays(year, nonWorkingList, [...workingOverrides])

  const nonWorkingForFile = nonWorkingList.filter((ds) => {
    if (ds.startsWith(String(year))) return true
    const y = Number(ds.slice(0, 4))
    if (y !== year - 1 && y !== year + 1) return false
    return rules.periods.some((p) => {
      const dates = eachDateInclusive(p.from, p.to)
      return dates.includes(ds)
    })
  })

  return {
    year,
    holidays: rules.holidays.filter((h) => h.date.startsWith(String(year))),
    periods: rules.periods,
    nonWorking: nonWorkingForFile,
    workingOverrides: [...workingOverrides].filter((ds) => ds.startsWith(String(year))),
    _stats: { workingDays, nonWorkingDays: 365 + (isLeap(year) ? 1 : 0) - workingDays },
  }
}

function isLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function countWorkingDays(year, nonWorking, workingOverrides) {
  const nonSet = new Set(nonWorking)
  const overrideSet = new Set(workingOverrides)
  let working = 0
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = formatDate(d)
    if (overrideSet.has(ds)) {
      working++
      continue
    }
    if (nonSet.has(ds)) continue
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue
    working++
  }
  return working
}

for (const year of Object.keys(RULES).map(Number)) {
  const cal = buildCalendarYear(year, RULES[year])
  const { _stats, ...json } = cal
  const path = join(dataDir, `holidays-ru-${year}.json`)
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
  console.log(
    `${year}: рабочих ${_stats.workingDays} (ожидается 247), нерабочих ${_stats.nonWorkingDays} (ожидается 118)`,
  )
  if (_stats.workingDays !== 247) {
    console.error(`  WARN: рабочих дней ${_stats.workingDays}, не 247`)
    process.exitCode = 1
  }
}

// Быстрая проверка ключевых дат (логика как в holidays.ts)
function isWorkingDayFromFiles(ds) {
  const y = Number(ds.slice(0, 4))
  const cals = [y - 1, y, y + 1]
    .map((yr) => {
      try {
        return JSON.parse(
          readFileSync(join(dataDir, `holidays-ru-${yr}.json`), 'utf8'),
        )
      } catch {
        return null
      }
    })
    .filter(Boolean)

  for (const cal of cals) {
    if (cal.workingOverrides.includes(ds)) return true
  }
  for (const cal of cals) {
    if (cal.nonWorking.includes(ds)) return false
  }
  const d = parseDate(ds)
  const dow = d.getDay()
  return dow !== 0 && dow !== 6
}

const spotChecks = [
  ['2024-12-30', false],
  ['2025-02-24', true],
  ['2025-11-01', true],
  ['2025-11-03', false],
  ['2025-12-31', false],
  ['2026-01-11', false],
  ['2026-01-12', true],
  ['2025-12-31', false],
  ['2027-01-05', false],
  ['2027-02-20', true],
  ['2027-11-05', false],
  ['2027-12-31', false],
]

for (const [ds, expect] of spotChecks) {
  const got = isWorkingDayFromFiles(ds)
  if (got !== expect) {
    console.error(`Spot check FAIL ${ds}: expected ${expect}, got ${got}`)
    process.exitCode = 1
  }
}
if (!process.exitCode) console.log('Spot checks: OK')
