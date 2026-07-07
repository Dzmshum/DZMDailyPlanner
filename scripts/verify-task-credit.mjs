/**
 * Зачёт просроченных задач в день закрытия.
 * Запуск: npx tsx scripts/verify-task-credit.mjs
 */
import {
  getDoneTasksForDay,
  getTaskCreditDayKey,
  isCompletedLate,
} from '../src/lib/selectors.ts'
import { parseDate } from '../src/lib/dates.ts'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

function task(id, deadline, completedAt, status = 'done') {
  return {
    id,
    title: id,
    status,
    deadline,
    completedAt: status === 'done' ? completedAt : null,
    createdAt: `${deadline}T09:00:00`,
    projectId: null,
    time: null,
    priority: 'medium',
    notes: '',
    jiraKey: null,
    attachments: [],
  }
}

const today = parseDate('2026-07-07')
const yesterday = parseDate('2026-07-06')

const lateDone = task('late', '2026-07-01', '2026-07-07T15:00:00')
const onTimeDone = task('ontime', '2026-07-07', '2026-07-07T10:00:00')
const earlyDone = task('early', '2026-07-10', '2026-07-07T10:00:00')
const tasks = [lateDone, onTimeDone, earlyDone]

assert('просроченная — зачёт сегодня', getTaskCreditDayKey(lateDone) === '2026-07-07')
assert('в срок — зачёт по дедлайну', getTaskCreditDayKey(onTimeDone) === '2026-07-07')
assert('раньше срока — зачёт по дедлайну', getTaskCreditDayKey(earlyDone) === '2026-07-10')
assert('isCompletedLate для просроченной', isCompletedLate(lateDone))
assert('isCompletedLate false в срок', !isCompletedLate(onTimeDone))

const todayDone = getDoneTasksForDay(tasks, today)
assert(
  'сегодня: в срок + просроченная',
  todayDone.length === 2 &&
    todayDone.some((t) => t.id === 'late') &&
    todayDone.some((t) => t.id === 'ontime'),
)
assert(
  'сегодня без ранней',
  !todayDone.some((t) => t.id === 'early'),
)

const oldDayDone = getDoneTasksForDay(tasks, parseDate('2026-07-01'))
assert('старый дедлайн без зачёта', oldDayDone.length === 0)

const futureDone = getDoneTasksForDay(tasks, parseDate('2026-07-10'))
assert('ранняя — только на дедлайне', futureDone.length === 1 && futureDone[0].id === 'early')

const sameDayLate = task('edge', '2026-07-06', '2026-07-06T23:00:00')
assert('закрыта в день дедлайна — не late', !isCompletedLate(sameDayLate))
assert(
  'закрыта в день дедлайна — зачёт вчера',
  getTaskCreditDayKey(sameDayLate) === '2026-07-06',
)
assert(
  'вчера в done',
  getDoneTasksForDay([sameDayLate], yesterday).length === 1,
)

if (!process.exitCode) {
  console.log('\nПроверка зачёта задач: все тесты пройдены')
}
