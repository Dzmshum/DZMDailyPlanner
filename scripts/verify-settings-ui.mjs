/**
 * Настройки: модалка, сайдбар, селектор просроченных в повестке.
 * Запуск: npx tsx scripts/verify-settings-ui.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getOverdueTasksForAgenda } from '../src/lib/selectors.ts'

const root = process.cwd()
const css = readFileSync(join(root, 'src/index.css'), 'utf8')
const sidebar = readFileSync(join(root, 'src/components/layout/Sidebar.tsx'), 'utf8')
const settingsModal = readFileSync(join(root, 'src/components/settings/SettingsModal.tsx'), 'utf8')
const uiIcon = readFileSync(join(root, 'src/components/ui/UiIcon.tsx'), 'utf8')

let failed = 0
let passed = 0

function assert(name, condition) {
  if (!condition) {
    console.error('FAIL:', name)
    failed += 1
  } else {
    console.log('OK:', name)
    passed += 1
  }
}

// --- Settings modal ---
assert('SettingsModal size xl', settingsModal.includes('size="xl"'))
assert('SettingsModal 3 tabs', (settingsModal.match(/id: SettingsTab/g) ?? []).length >= 1)
assert('SettingsModal appearance tab', settingsModal.includes("'appearance'"))
assert('SettingsModal data tab', settingsModal.includes("'data'"))
assert('SettingsModal integrations tab', settingsModal.includes("'integrations'"))
assert('SettingsModal settings-panel', settingsModal.includes('className="settings-panel"'))

// --- Fixed modal layout ---
assert('modal-xl fixed height', /\.modal-xl\s*\{[^}]*height:\s*min\(82vh,\s*780px\)/s.test(css))
assert('modal-xl fixed width', /\.modal-xl\s*\{[^}]*width:\s*min\(920px/s.test(css))
assert('modal-xl body overflow hidden', css.includes('.modal-xl .modal-body') && css.includes('overflow: hidden'))
assert('settings-layout height 100%', /\.settings-layout\s*\{[^}]*height:\s*100%/s.test(css))
assert('settings-panel scroll', /\.settings-panel\s*\{[^}]*overflow-y:\s*auto/s.test(css))

// --- Sidebar settings button ---
assert('sidebar-footer centered', /\.sidebar-footer\s*\{[^}]*justify-content:\s*center/s.test(css))
assert('settings-btn width auto', /\.nav-item\.settings-btn\s*\{[^}]*width:\s*auto/s.test(css))
assert('Sidebar settings UiIcon', sidebar.includes('icon="settings"'))
assert('Sidebar nav-item settings-btn', sidebar.includes('className="nav-item settings-btn"'))

// --- UiIcon settings ---
assert("UiIcon type settings", uiIcon.includes("'settings'"))

// --- Agenda overdue selector ---
const agendaDay = new Date(2026, 6, 7)
const tasks = [
  {
    id: '1',
    title: 'Overdue',
    deadline: '2026-07-05',
    status: 'todo',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '2',
    title: 'Same day',
    deadline: '2026-07-07',
    status: 'todo',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: '3',
    title: 'Done overdue',
    deadline: '2026-07-01',
    status: 'done',
    notes: '',
    projectId: null,
    priority: 'medium',
    attachments: [],
    jiraKey: null,
    createdAt: '2026-07-01T10:00:00.000Z',
    completedAt: '2026-07-06T10:00:00.000Z',
  },
]

const overdue = getOverdueTasksForAgenda(tasks, agendaDay)
assert('getOverdueTasksForAgenda count', overdue.length === 1)
assert('getOverdueTasksForAgenda id', overdue[0]?.id === '1')
assert('getOverdueTasksForAgenda excludes same day', !overdue.some((t) => t.id === '2'))
assert('getOverdueTasksForAgenda excludes done', !overdue.some((t) => t.id === '3'))

if (failed > 0) {
  console.error(`\n${failed} failed, ${passed} passed`)
  process.exit(1)
}

console.log(`\nSettings UI OK: ${passed} checks`)
