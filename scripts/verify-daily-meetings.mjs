/**
 * Проверка логики дейликов без vitest.
 * Запуск: node scripts/verify-daily-meetings.mjs
 */
import { addDays } from 'date-fns'
import {
  getDailyReportPeriod,
  getDoneTasksForDailyReport,
  getDoneTasksForTargetDaily,
  getPastDailyMeetings,
  getPeriodEndDeferredTasks,
  getTargetDailyMeeting,
  isAfterDailyCutoff,
  isCompletedForDailyReport,
} from '../src/lib/dailyMeetings.ts'
import { parseDate, formatDate } from '../src/lib/dates.ts'
import { normalizeDailyDays } from '../src/lib/dailyLabels.ts'
import { normalizePlan, createDefaultPlan } from '../src/types/index.ts'

const DOW = [1, 4]

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

function d(str) {
  return parseDate(str)
}

function task(id, completedAt) {
  return {
    id,
    title: id,
    status: 'done',
    completedAt,
    createdAt: completedAt,
    projectId: null,
    deadline: null,
    time: null,
    priority: 'medium',
    notes: '',
    jiraKey: null,
  }
}

// --- Пример пользователя: дейлик 2 июля, закрытое до 1 июля включительно ---
const july2 = d('2026-07-02') // четверг
const periodJuly2 = getDailyReportPeriod(DOW, july2)

assert('target = 2 июля', formatDate(periodJuly2.targetDaily) === '2026-07-02')
assert('periodEnd = 1 июля', formatDate(periodJuly2.periodEnd) === '2026-07-01')

assert(
  '30.06 входит в отчёт 2 июля',
  isCompletedForDailyReport(d('2026-06-30'), july2, periodJuly2.previousDaily, DOW),
)
assert(
  '01.07 входит в отчёт 2 июля',
  isCompletedForDailyReport(d('2026-07-01'), july2, periodJuly2.previousDaily, DOW),
)
assert(
  '02.07 НЕ входит в отчёт 2 июля → следующий дейлик',
  !isCompletedForDailyReport(d('2026-07-02'), july2, periodJuly2.previousDaily, DOW),
)
assert(
  '03.07 НЕ входит в отчёт 2 июля',
  !isCompletedForDailyReport(d('2026-07-03'), july2, periodJuly2.previousDaily, DOW),
)

// Закрытое 2 июля попадает в СЛЕДУЮЩИЙ дейлик (пн 6 июля)
const july6 = d('2026-07-06')
const periodJuly6 = getDailyReportPeriod(DOW, july6)

assert(
  '02.07 входит в отчёт 6 июля (день прошлого дейлика)',
  isCompletedForDailyReport(d('2026-07-02'), july6, periodJuly6.previousDaily, DOW),
)
assert(
  '05.07 входит в отчёт 6 июля',
  isCompletedForDailyReport(d('2026-07-05'), july6, periodJuly6.previousDaily, DOW),
)
assert(
  '06.07 НЕ входит в отчёт 6 июля',
  !isCompletedForDailyReport(d('2026-07-06'), july6, periodJuly6.previousDaily, DOW),
)

// Список задач для отчёта 2 июля
const tasks = [
  task('a', '2026-06-30T10:00:00'),
  task('b', '2026-07-01T10:00:00'),
  task('c', '2026-07-02T10:00:00'),
  task('d', '2026-07-03T10:00:00'),
]
const doneJuly2 = getDoneTasksForDailyReport(tasks, DOW, july2).map((t) => t.id)
assert(
  'список 2 июля = a,b',
  doneJuly2.length === 2 && doneJuly2.includes('a') && doneJuly2.includes('b'),
)

const doneJuly6 = getDoneTasksForDailyReport(tasks, DOW, july6).map((t) => t.id)
assert('список 6 июля включает c (закрыто 2 июля)', doneJuly6.includes('c'))

// Между дейликами: сегодня 4 июля → готовимся к 6 июля
const july4 = d('2026-07-04')
const periodJuly4view = getDailyReportPeriod(DOW, july4)
assert(
  '4 июля смотрим на дейлик 6 июля',
  formatDate(periodJuly4view.targetDaily) === '2026-07-06',
)

// День дейлика: закрытое в этот же день не в текущем отчёте
const doneOnDailyDay = getDoneTasksForDailyReport(
  [task('x', '2026-07-02T15:00:00')],
  DOW,
  july2,
)
assert('закрыто в день дейлика 2 июля не в отчёте 2 июля', doneOnDailyDay.length === 0)

// --- Обобщение: любой рабочий пн/чт (август 2026 — без праздников) ---

// Дейлик 6 августа 2026 (чт): закрытое до 5 августа включительно
const aug6 = d('2026-08-06')
const periodAug6 = getDailyReportPeriod(DOW, aug6)
assert('target = 6 августа', formatDate(periodAug6.targetDaily) === '2026-08-06')
assert('periodEnd = 5 августа', formatDate(periodAug6.periodEnd) === '2026-08-05')
assert(
  '05.08 входит в отчёт 6 августа',
  isCompletedForDailyReport(d('2026-08-05'), aug6, periodAug6.previousDaily, DOW),
)
assert(
  '06.08 НЕ входит в отчёт 6 августа',
  !isCompletedForDailyReport(d('2026-08-06'), aug6, periodAug6.previousDaily, DOW),
)

// Закрытое в день прошлого дейлика (3 авг пн) → в отчёт 6 авг
assert(
  '03.08 (день прошлого дейлика) входит в отчёт 6 августа',
  isCompletedForDailyReport(d('2026-08-03'), aug6, periodAug6.previousDaily, DOW),
)

// Следующий дейлик 10 августа (пн)
const aug10 = d('2026-08-10')
const periodAug10 = getDailyReportPeriod(DOW, aug10)
assert(
  '06.08 входит в отчёт 10 августа',
  isCompletedForDailyReport(d('2026-08-06'), aug10, periodAug10.previousDaily, DOW),
)
assert(
  '10.08 НЕ входит в отчёт 10 августа',
  !isCompletedForDailyReport(d('2026-08-10'), aug10, periodAug10.previousDaily, DOW),
)

// Праздник: 1 мая 2026 — выходной, дейлик сдвигается
const may1 = d('2026-05-01')
const periodMay1 = getDailyReportPeriod(DOW, may1)
assert(
  '1 мая 2026 — смотрим на ближайший рабочий дейлик (не 1 мая)',
  formatDate(periodMay1.targetDaily) !== '2026-05-01',
)

// Между дейликами: пятница 7 августа → готовимся к пн 10 августа
const aug7 = d('2026-08-07')
const periodAug7 = getDailyReportPeriod(DOW, aug7)
assert(
  '7 августа смотрим на дейлик 10 августа',
  formatDate(periodAug7.targetDaily) === '2026-08-10',
)

// До прошлого дейлика — не входит
assert(
  '31.07 не входит в отчёт 6 августа (до прошлого дейлика)',
  !isCompletedForDailyReport(d('2026-07-31'), aug6, periodAug6.previousDaily, DOW),
)

// --- Отсечка 13:00 ---

assert('13:00:00 не после отсечки', !isAfterDailyCutoff(d('2026-07-05T13:00:00')))
assert('13:00:01 после отсечки', isAfterDailyCutoff(d('2026-07-05T13:00:01')))
assert('12:59 не после отсечки', !isAfterDailyCutoff(d('2026-07-05T12:59:59')))

assert(
  '05.07 12:59 входит в отчёт 6 июля',
  isCompletedForDailyReport(
    d('2026-07-05T12:59:00'),
    july6,
    periodJuly6.previousDaily,
    DOW,
  ),
)
assert(
  '05.07 13:00 входит в отчёт 6 июля',
  isCompletedForDailyReport(
    d('2026-07-05T13:00:00'),
    july6,
    periodJuly6.previousDaily,
    DOW,
  ),
)
assert(
  '05.07 13:01 НЕ входит в отчёт 6 июля → следующий дейлик',
  !isCompletedForDailyReport(
    d('2026-07-05T13:01:00'),
    july6,
    periodJuly6.previousDaily,
    DOW,
  ),
)

const july9date = d('2026-07-09')
const periodJuly9 = getDailyReportPeriod(DOW, july9date)

assert(
  '05.07 13:30 входит в отчёт 9 июля (перенос после отсечки)',
  isCompletedForDailyReport(
    d('2026-07-05T13:30:00'),
    july9date,
    periodJuly9.previousDaily,
    DOW,
  ),
)

assert(
  '02.07 10:00 входит в отчёт 6 июля (день прошлого дейлика до 13:00)',
  isCompletedForDailyReport(
    d('2026-07-02T10:00:00'),
    july6,
    periodJuly6.previousDaily,
    DOW,
  ),
)
assert(
  '02.07 14:00 входит в отчёт 6 июля (день прошлого дейлика)',
  isCompletedForDailyReport(
    d('2026-07-02T14:00:00'),
    july6,
    periodJuly6.previousDaily,
    DOW,
  ),
)

const july6morning = d('2026-07-06T10:00:00')
const july6afternoon = d('2026-07-06T14:00:00')
assert(
  '6 июля до 13:00 — target 6 июля',
  formatDate(getTargetDailyMeeting(july6morning, DOW)) === '2026-07-06',
)
assert(
  '6 июля после 13:00 — target 9 июля',
  formatDate(getTargetDailyMeeting(july6afternoon, DOW)) === '2026-07-09',
)

const periodJuly6afternoon = getDailyReportPeriod(DOW, july6afternoon)
assert(
  'после 13:00 6 июля смотрим на дейлик 9 июля',
  formatDate(periodJuly6afternoon.targetDaily) === '2026-07-09',
)

const doneJuly6afternoon = getDoneTasksForDailyReport(
  [task('late', '2026-07-05T14:00:00'), task('ontime', '2026-07-05T12:00:00')],
  DOW,
  july6morning,
).map((t) => t.id)
assert(
  'утром 6 июля late ещё не в отчёте',
  doneJuly6afternoon.includes('ontime') && !doneJuly6afternoon.includes('late'),
)

const doneJuly6afternoonView = getDoneTasksForDailyReport(
  [task('late', '2026-07-05T14:00:00'), task('ontime', '2026-07-05T12:00:00')],
  DOW,
  july6afternoon,
).map((t) => t.id)
assert(
  'после 13:00 6 июля late уже в новом отчёте 9 июля',
  doneJuly6afternoonView.includes('late') && !doneJuly6afternoonView.includes('ontime'),
)

const past = getPastDailyMeetings(july6afternoon, DOW, 3).map((x) => formatDate(x))
assert(
  'прошлые дейлики: 6, 2, 29 июня',
  past[0] === '2026-07-06' && past[1] === '2026-07-02' && past[2] === '2026-06-29',
)

const july6pastCount = getDoneTasksForTargetDaily(
  [
    task('a', '2026-07-02T10:00:00'),
    task('b', '2026-07-05T12:00:00'),
    task('c', '2026-07-05T14:00:00'),
  ],
  july6,
  DOW,
).map((t) => t.id)
assert(
  'отчёт 6 июля: a,b без c (c после 13:00 5 июля)',
  july6pastCount.length === 2 && july6pastCount.includes('a') && july6pastCount.includes('b'),
)

const deferredJuly6 = getPeriodEndDeferredTasks(
  [
    task('a', '2026-07-02T10:00:00'),
    task('b', '2026-07-05T12:00:00'),
    task('c', '2026-07-05T14:00:00'),
  ],
  july6,
).map((t) => t.id)
assert('перенос 6 июля: только c', deferredJuly6.length === 1 && deferredJuly6[0] === 'c')

// --- normalizeDailyDays ---
assert('normalizeDailyDays default', JSON.stringify(normalizeDailyDays(null)) === '[1,4]')
assert('normalizeDailyDays empty → fallback', JSON.stringify(normalizeDailyDays([])) === '[1,4]')
assert(
  'normalizeDailyDays dedupe sort',
  JSON.stringify(normalizeDailyDays([4, 1, 4, 3])) === '[1,3,4]',
)
assert(
  'normalizeDailyDays invalid filtered',
  JSON.stringify(normalizeDailyDays([1, 9, -1, 4])) === '[1,4]',
)

const planWeekdays = normalizePlan({
  ...createDefaultPlan(),
  settings: {
    ...createDefaultPlan().settings,
    daily: { enabled: true, days: [1, 2, 3, 4, 5] },
  },
})
assert(
  'normalizePlan daily weekdays',
  JSON.stringify(planWeekdays.settings.daily.days) === '[1,2,3,4,5]',
)

// --- Кастомные дни: только среда ---
const WED = [3]
const wedAug5 = d('2026-08-05') // среда
const periodWed = getDailyReportPeriod(WED, wedAug5)
assert('среда: target = 5 августа', formatDate(periodWed.targetDaily) === '2026-08-05')
assert(
  '04.08 входит в отчёт среды 5 августа',
  isCompletedForDailyReport(d('2026-08-04'), wedAug5, periodWed.previousDaily, WED),
)

// --- Пн–Пт ---
const WEEKDAYS = [1, 2, 3, 4, 5]
const friAug7 = d('2026-08-07')
const periodFri = getDailyReportPeriod(WEEKDAYS, friAug7)
assert(
  'пятница при буднях: target 7 августа',
  formatDate(periodFri.targetDaily) === '2026-08-07',
)

// --- Пн, Ср, Пт ---
const MWF = [1, 3, 5]
const wedAug12 = d('2026-08-12')
const periodMWF = getDailyReportPeriod(MWF, wedAug12)
assert(
  'среда при MWF: target 12 августа',
  formatDate(periodMWF.targetDaily) === '2026-08-12',
)

if (process.exitCode) {
  console.error('\nЕсть ошибки проверки')
} else {
  console.log('\nВсе проверки пройдены')
}
