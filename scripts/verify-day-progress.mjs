/**
 * Прогресс дня — getDayProgress.
 * Запуск: npx tsx scripts/verify-day-progress.mjs
 */
import {
  getDayProgress,
  getDoneTasksForDay,
  getTasksForDay,
} from '../src/lib/selectors.ts'
import { parseDate } from '../src/lib/dates.ts'
import { normalizePlan, createDefaultPlan } from '../src/types/index.ts'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

function task(id, deadline, status = 'active', completedAt = null) {
  return {
    id,
    title: id,
    status: status === 'done' ? 'done' : 'active',
    deadline,
    completedAt: status === 'done' ? completedAt : null,
    createdAt: `${deadline ?? '2026-07-07'}T09:00:00`,
    projectId: null,
    time: null,
    priority: 'medium',
    notes: '',
    jiraKey: null,
    attachments: [],
  }
}

const today = parseDate('2026-07-07')
const future = parseDate('2026-07-10')

// Пустой день
const empty = getDayProgress([], today)
assert('пустой день: total 0', empty.total === 0 && empty.done === 0 && empty.ratio === 0)

// Все выполнены на сегодня
const allDone = [
  task('a', '2026-07-07', 'done', '2026-07-07T10:00:00'),
  task('b', '2026-07-07', 'done', '2026-07-07T11:00:00'),
]
const allDoneProgress = getDayProgress(allDone, today)
assert('все done: 2/2', allDoneProgress.done === 2 && allDoneProgress.total === 2 && allDoneProgress.ratio === 1)

// Смешанный день
const mixed = [
  ...allDone,
  task('c', '2026-07-07', 'active'),
  task('d', '2026-07-07', 'active'),
]
const mixedProgress = getDayProgress(mixed, today)
assert('смешанный: 2/4', mixedProgress.done === 2 && mixedProgress.total === 4 && mixedProgress.ratio === 0.5)

// Просроченная закрыта сегодня
const lateDone = task('late', '2026-07-01', 'done', '2026-07-07T15:00:00')
const lateProgress = getDayProgress([lateDone], today)
assert(
  'просроченная закрыта сегодня: 1/1',
  lateProgress.done === 1 && lateProgress.total === 1,
)
assert(
  'просроченная в getDoneTasksForDay сегодня',
  getDoneTasksForDay([lateDone], today).length === 1,
)

// Ранняя выполнена — не в сегодня
const earlyDone = task('early', '2026-07-10', 'done', '2026-07-07T10:00:00')
const earlyToday = getDayProgress([earlyDone], today)
assert('ранняя не в сегодня', earlyToday.total === 0 && earlyToday.done === 0)
const earlyFuture = getDayProgress([earlyDone], future)
assert('ранняя на дедлайне: 1/1', earlyFuture.done === 1 && earlyFuture.total === 1)

// Inbox не входит
const inbox = task('inbox', null, 'active')
inbox.deadline = null
const withInbox = getDayProgress([...mixed, inbox], today)
assert('inbox не влияет', withInbox.total === mixedProgress.total)

// Активная на сегодня + просроченная закрыта сегодня
const combo = [
  task('active1', '2026-07-07', 'active'),
  lateDone,
]
const comboProgress = getDayProgress(combo, today)
assert('активная + late done: 1/2', comboProgress.done === 1 && comboProgress.total === 2)

// getTasksForDay не включает done
assert(
  'getTasksForDay только активные',
  getTasksForDay(mixed, today).length === 2,
)

// normalizePlan defaults
const legacy = normalizePlan({
  ...createDefaultPlan(),
  settings: {
    ...createDefaultPlan().settings,
    dayProgress: undefined,
  },
})
assert(
  'normalizePlan: dayProgress defaults',
  legacy.settings.dayProgress.showOnAgenda === true &&
    legacy.settings.dayProgress.showOnDashboard === true,
)

if (!process.exitCode) {
  console.log('\nПроверка прогресса дня: все тесты пройдены')
}
