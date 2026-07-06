/**
 * Проверка логики вложений (фото к задачам) без Vitest.
 * Запуск: npx tsx scripts/verify-attachments.mjs
 */
import { normalizePlan } from '../src/types/index.ts'
import { canSaveTask, resolveTaskTitle } from '../src/lib/taskTitle.ts'
import {
  getAddedAttachments,
  getRemovedAttachments,
} from '../src/lib/attachmentCleanup.ts'

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    process.exitCode = 1
  } else {
    console.log('OK:', name)
  }
}

function attachment(id, name = 'shot.png') {
  return {
    id,
    name,
    mimeType: 'image/jpeg',
    fileName: `${id}.jpg`,
  }
}

// --- taskTitle ---
assert('canSaveTask: пусто без вложений', !canSaveTask('', []))
assert('canSaveTask: только название', canSaveTask('Задача', []))
assert('canSaveTask: только фото', canSaveTask('', [attachment('a1')]))
assert('canSaveTask: пробелы не считаются', !canSaveTask('   ', []))

assert(
  'resolveTaskTitle: явное название',
  resolveTaskTitle('  Моя задача  ', [attachment('a1')]) === 'Моя задача',
)
assert(
  'resolveTaskTitle: из имени файла',
  resolveTaskTitle('', [attachment('a1', 'screenshot.png')]) === 'screenshot',
)
assert(
  'resolveTaskTitle: fallback «Фото»',
  resolveTaskTitle('', [attachment('a1', '.png')]) === 'Фото',
)
assert('resolveTaskTitle: пусто', resolveTaskTitle('', []) === '')

// --- attachmentCleanup diff ---
const initial = [attachment('a1'), attachment('a2')]
const current = [attachment('a2'), attachment('a3')]

const added = getAddedAttachments(initial, current)
const removed = getRemovedAttachments(initial, current)

assert('getAddedAttachments: одно новое', added.length === 1 && added[0].id === 'a3')
assert('getRemovedAttachments: одно удалённое', removed.length === 1 && removed[0].id === 'a1')

// --- normalizePlan ---
const legacy = normalizePlan({
  version: 1,
  settings: {
    theme: 'system',
    colorPalette: 'northrend',
    defaultView: 'dashboard',
    windowMode: 'standard',
    calendar: { showHolidays: true, calendarView: 'week' },
    daily: { enabled: true, days: [1, 4] },
    export: { includeDone: false, skipEmptyDays: true, exportTitle: 'x' },
    voiceInputEnabled: false,
    jira: {
      enabled: false,
      baseUrl: '',
      email: '',
      apiToken: '',
      projectKey: '',
      issueType: 'Task',
    },
  },
  projects: [],
  tasks: [
    {
      id: 't1',
      title: 'Без attachments в JSON',
      projectId: null,
      deadline: null,
      time: null,
      priority: 'medium',
      status: 'todo',
      notes: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
      jiraKey: null,
    },
  ],
})

assert(
  'normalizePlan: attachments → [] для старых задач',
  Array.isArray(legacy.tasks[0].attachments) && legacy.tasks[0].attachments.length === 0,
)

const withAttachments = normalizePlan({
  ...legacy,
  tasks: [
    {
      ...legacy.tasks[0],
      attachments: [attachment('x1')],
    },
  ],
})

assert(
  'normalizePlan: сохраняет attachments',
  withAttachments.tasks[0].attachments.length === 1 &&
    withAttachments.tasks[0].attachments[0].id === 'x1',
)

if (process.exitCode) {
  console.error('\nПроверка вложений: есть ошибки')
  process.exit(1)
}

console.log('\nПроверка вложений: все тесты пройдены')
