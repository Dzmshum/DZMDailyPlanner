/**
 * Подписи праздников в UI vs производственный календарь.
 * Запуск: npx tsx scripts/verify-holiday-labels.mjs
 */
import {
  countHolidayLabelsInYear,
  formatHolidayShort,
  getHolidayForDate,
  hasHolidayData,
  isApproximateHolidayYear,
  isNonWorkingDay,
} from '../src/lib/holidays.ts'
import { parseDate } from '../src/lib/dates.ts'
import holidays2026 from '../src/data/holidays-ru-2026.json'
import holidays2027 from '../src/data/holidays-ru-2027.json'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

const nonWorking2026 = holidays2026.nonWorking.filter((d) => d.startsWith('2026'))
assert('2026 нерабочих в году = 118', nonWorking2026.length === 118)
assert('именованных праздников ~11', holidays2026.holidays.length === 11)
assert('periods в JSON', Array.isArray(holidays2026.periods) && holidays2026.periods.length > 0)

const yearLabels = countHolidayLabelsInYear(2026)
assert('подписей в 2026 заметно больше 11', yearLabels >= 25)

const newYear = getHolidayForDate(parseDate('2026-01-05'))
assert('5 янв — каникулы', newYear?.name === 'Новогодние каникулы')
assert(
  '5 янв — короткая подпись',
  newYear !== null && formatHolidayShort(parseDate('2026-01-05'), newYear) === 'Каникулы',
)

const weekendInMay = getHolidayForDate(parseDate('2026-05-02'))
assert('2 мая (сб) — период 1 мая', weekendInMay?.name === '1 мая')

const bridge = getHolidayForDate(parseDate('2026-03-09'))
assert('9 марта — 8 марта', bridge?.name === '8 марта')

const knowledge = getHolidayForDate(parseDate('2026-09-01'))
assert('1 сент — День знаний', knowledge?.name === 'День знаний')
assert('1 сент — рабочий день', isNonWorkingDay(parseDate('2026-09-01')) === false)

const plainWeekend = getHolidayForDate(parseDate('2026-11-01'))
assert('1 ноя (вс) без периода — без подписи', plainWeekend === null)

// 2027 — проект ПП
const nonWorking2027 = holidays2027.nonWorking.filter((d) => d.startsWith('2027'))
assert('2027 нерабочих в году = 118', nonWorking2027.length === 118)
assert('2027 periods в JSON', Array.isArray(holidays2027.periods) && holidays2027.periods.length > 0)
const labels2027 = countHolidayLabelsInYear(2027)
assert('подписей в 2027 >= 25', labels2027 >= 25)
assert('5 янв 2027 — каникулы', getHolidayForDate(parseDate('2027-01-05'))?.name === 'Новогодние каникулы')
assert('7 янв 2027 — Рождество', getHolidayForDate(parseDate('2027-01-07'))?.name === 'Рождество')
assert('5 ноя 2027 — перенос', getHolidayForDate(parseDate('2027-11-05'))?.name === 'Перенос с 02.01')
assert('20 фев 2027 — рабочая суббота', isNonWorkingDay(parseDate('2027-02-20')) === false)

// 2028+ — приблизительный календарь (ст. 112 ТК РФ)
assert('2028 hasHolidayData', hasHolidayData(2028) === true)
assert('2028 approximate', isApproximateHolidayYear(2028) === true)
assert('2028 май — 9 мая', getHolidayForDate(parseDate('2028-05-09'))?.name === '9 мая')
const labels2028 = countHolidayLabelsInYear(2028)
assert('подписей в 2028 >= 10', labels2028 >= 10)

if (process.exitCode) {
  console.error('\nЕсть ошибки проверки')
} else {
  console.log('\nВсе проверки пройдены')
}
