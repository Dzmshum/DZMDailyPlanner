import assert from 'node:assert/strict'
import { addDays, format } from 'date-fns'
import { exportPlanText, getRecentlyDoneByDay } from '../src/lib/exportPlanText.ts'
import { createDefaultPlan, normalizePlan } from '../src/types/index.ts'
import { formatDate } from '../src/lib/dates.ts'

function task(id, title, opts = {}) {
  return {
    id,
    title,
    notes: '',
    deadline: opts.deadline ?? null,
    projectId: null,
    priority: 'medium',
    status: opts.status ?? 'todo',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: opts.completedAt ?? null,
  }
}

const today = new Date(2026, 6, 7)
const todayStr = formatDate(today)

const plan = createDefaultPlan()
plan.tasks = [
  task('a', 'Активная на неделе', { deadline: formatDate(addDays(today, 2)) }),
  task('inbox', 'Входящая без срока'),
  task('b', 'Сделано сегодня', {
    status: 'done',
    completedAt: `${todayStr}T14:00:00.000Z`,
  }),
  task('c', 'Сделано вчера', {
    status: 'done',
    completedAt: `${formatDate(addDays(today, -1))}T12:00:00.000Z`,
  }),
  task('d', 'Старое сделанное', {
    status: 'done',
    completedAt: `${formatDate(addDays(today, -20))}T12:00:00.000Z`,
  }),
]

const byDay = getRecentlyDoneByDay(plan.tasks, 7, today)
assert.equal(byDay.size, 2, 'recent done: 2 days in window')
assert.ok(byDay.has(formatDate(today)), 'includes today')
assert.ok(byDay.has(formatDate(addDays(today, -1))), 'includes yesterday')

const text = exportPlanText(plan, {
  period: 'week',
  anchorDate: today,
  skipEmptyDays: true,
  includeRecentDone: true,
  recentDoneDays: 7,
})

assert.ok(text.includes('Сделано за 7 дн.:'), 'has recent done header')
assert.ok(text.includes('Сделано сегодня'), 'includes today task title')
assert.ok(text.includes('Сделано вчера'), 'includes yesterday task title')
assert.ok(!text.includes('Старое сделанное'), 'excludes old done outside window')
assert.match(text, /\d{2}\/\d{2}: Сделано сегодня/, 'brief day line format')

const withInbox = exportPlanText(plan, {
  period: 'week',
  anchorDate: today,
  includeInbox: true,
})
assert.ok(withInbox.includes('Без срока:'), 'includeInbox adds inbox section')
assert.ok(withInbox.includes('Входящая без срока'), 'inbox task listed')

const withoutInbox = exportPlanText(plan, {
  period: 'week',
  anchorDate: today,
  includeInbox: false,
})
assert.ok(!withoutInbox.includes('Без срока:'), 'inbox off by default')

const normalized = normalizePlan({
  ...plan,
  settings: {
    ...plan.settings,
    export: { ...plan.settings.export, recentDoneDays: 120, includeRecentDone: true },
  },
})
assert.equal(normalized.settings.export.recentDoneDays, 90, 'clamp recentDoneDays to 90')
assert.equal(normalized.settings.export.includeRecentDone, true)
assert.equal(normalized.settings.export.includeInbox, false)

console.log('OK: includeInbox export section')
console.log('OK: getRecentlyDoneByDay window')
console.log('OK: normalizePlan export settings')

console.log('\nПроверка экспорта текста: все тесты пройдены')
