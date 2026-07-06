/**
 * Превью задач в месячном календаре.
 * Запуск: node scripts/verify-month-calendar.mjs
 */
import { getMonthCellTaskPreview } from '../src/lib/selectors.ts'
import {
  computeMonthCellPreviewLimit,
  resolveMonthCellTaskPreview,
} from '../src/lib/monthCalendarLayout.ts'
import { parseDate } from '../src/lib/dates.ts'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

function task(id, deadline, status = 'todo') {
  return {
    id,
    title: id,
    status,
    deadline,
    completedAt: status === 'done' ? `${deadline}T12:00:00` : null,
    createdAt: `${deadline}T09:00:00`,
    projectId: null,
    time: null,
    priority: 'medium',
    notes: '',
    jiraKey: null,
    attachments: [],
  }
}

const day = parseDate('2026-07-15')
const tasks = [
  task('a', '2026-07-15'),
  task('b', '2026-07-15'),
  task('c', '2026-07-15'),
  task('d', '2026-07-15', 'done'),
  task('e', '2026-07-16'),
]

const preview = getMonthCellTaskPreview(tasks, day, 2)
assert('показываем 2 из 4', preview.items.length === 2 && preview.overflow === 2)
assert('total = 4', preview.total === 4)
assert(
  'сначала активные',
  preview.items[0].task.id === 'a' && preview.items[1].task.id === 'b',
)
assert('активные не done', !preview.items[0].done && !preview.items[1].done)

const onlyDone = getMonthCellTaskPreview(
  [task('x', '2026-07-01', 'done'), task('y', '2026-07-01', 'done')],
  parseDate('2026-07-01'),
  2,
)
assert(
  'только выполненные',
  onlyDone.items.length === 2 && onlyDone.items.every((i) => i.done),
)

const empty = getMonthCellTaskPreview([], day)
assert('пустой день', empty.total === 0 && empty.overflow === 0)

assert(
  'лимит по высоте: высокая сетка',
  computeMonthCellPreviewLimit(900, 6) >= 5,
)
assert(
  'лимит по высоте: низкая ячейка',
  computeMonthCellPreviewLimit(76 * 6, 6) === 1,
)

const resolved = resolveMonthCellTaskPreview(
  [
    task('a', '2026-07-15'),
    task('b', '2026-07-15'),
    task('c', '2026-07-15'),
  ],
  day,
  2,
)
assert(
  'резерв под +N: 2 слота → 1 задача + overflow 2',
  resolved.items.length === 1 && resolved.overflow === 2,
)

if (process.exitCode) {
  console.error('\nЕсть ошибки проверки')
} else {
  console.log('\nВсе проверки пройдены')
}
