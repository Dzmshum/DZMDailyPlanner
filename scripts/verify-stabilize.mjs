import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { isAllowedJiraBaseUrl } from '../src/lib/jiraUrl.ts'
import { redactPlanForExport } from '../src/lib/planExport.ts'
import { createDefaultPlan, normalizePlan } from '../src/types/index.ts'
import { MAX_ATTACHMENT_BYTES } from '../src/lib/attachmentLimits.ts'

const require = createRequire(import.meta.url)
const electronJiraUrl = require('../electron/jira-url.cjs')

let checks = 0
function ok(cond, msg) {
  assert.ok(cond, msg)
  checks += 1
}

// --- Jira URL allowlist ---
ok(isAllowedJiraBaseUrl('https://company.atlassian.net'), 'https cloud ok')
ok(isAllowedJiraBaseUrl('https://jira.example.com/'), 'https custom ok')
ok(!isAllowedJiraBaseUrl('http://company.atlassian.net'), 'http rejected')
ok(!isAllowedJiraBaseUrl('https://127.0.0.1'), 'loopback rejected')
ok(!isAllowedJiraBaseUrl('https://localhost'), 'localhost rejected')
ok(!isAllowedJiraBaseUrl('https://192.168.1.1'), 'private ipv4 rejected')
ok(!isAllowedJiraBaseUrl('https://169.254.169.254'), 'link-local rejected')
ok(!isAllowedJiraBaseUrl('not-a-url'), 'garbage rejected')
ok(
  electronJiraUrl.isAllowedJiraBaseUrl('https://company.atlassian.net') ===
    isAllowedJiraBaseUrl('https://company.atlassian.net'),
  'electron mirror matches TS for cloud',
)
ok(
  electronJiraUrl.isAllowedJiraBaseUrl('https://127.0.0.1') === false,
  'electron mirror rejects loopback',
)

// --- Export redact ---
const plan = createDefaultPlan()
plan.settings.jira = {
  ...plan.settings.jira,
  enabled: true,
  apiToken: 'secret-token-value',
  email: 'a@b.c',
  baseUrl: 'https://x.atlassian.net',
  projectKey: 'PRJ',
}
const redacted = redactPlanForExport(plan)
ok(redacted.settings.jira.apiToken === '', 'export strips apiToken')
ok(plan.settings.jira.apiToken === 'secret-token-value', 'source plan unchanged')
ok(redacted.settings.jira.email === 'a@b.c', 'email kept in export')

// --- normalizePlan hardening ---
const fromNull = normalizePlan(null)
ok(Array.isArray(fromNull.tasks) && fromNull.tasks.length === 0, 'null → empty tasks')
ok(fromNull.settings.theme === 'system', 'null → default theme')

const fromMissingTasks = normalizePlan({ version: 1, settings: {}, projects: [] })
ok(Array.isArray(fromMissingTasks.tasks), 'missing tasks → []')

const fromBadTask = normalizePlan({
  version: 1,
  settings: {},
  projects: [{ id: 'p1', name: 'P' }],
  tasks: [{ id: 't1', notes: null, title: 123 }],
})
ok(fromBadTask.tasks[0].title === 'Без названия', 'bad title coerced')
ok(typeof fromBadTask.tasks[0].notes === 'string', 'notes always string')
ok(fromBadTask.tasks[0].notes.trim() === '', 'notes trim-safe')

// --- Attachment limit constant ---
ok(MAX_ATTACHMENT_BYTES === 8 * 1024 * 1024, '8MB attachment cap')

// --- Hotkeys cancel events wired in source ---
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const hotkeys = readFileSync(path.join(root, 'src/hooks/useHotkeys.ts'), 'utf8')
ok(
  hotkeys.includes('planboard:cancel-task-form') &&
    hotkeys.includes('planboard:cancel-quick-capture'),
  'Escape dispatches cancel events',
)
const taskForm = readFileSync(path.join(root, 'src/components/tasks/TaskForm.tsx'), 'utf8')
ok(taskForm.includes('planboard:cancel-task-form'), 'TaskForm listens cancel')
const quick = readFileSync(
  path.join(root, 'src/components/ui/QuickCaptureModal.tsx'),
  'utf8',
)
ok(quick.includes('planboard:cancel-quick-capture'), 'QuickCapture listens cancel')

const store = readFileSync(path.join(root, 'src/store/planStore.ts'), 'utf8')
ok(store.includes('persistQueued'), 'persist queue flag present')

const defaultPlanPath = path.join(root, 'electron/default-plan.json')
const diskDefault = JSON.parse(readFileSync(defaultPlanPath, 'utf8'))
const tsDefault = createDefaultPlan()
ok(
  JSON.stringify(diskDefault) === JSON.stringify(tsDefault),
  'electron/default-plan.json matches createDefaultPlan()',
)
ok(!existsSync(path.join(root, 'src-tauri')), 'src-tauri removed')

console.log(`verify-stabilize: ${checks} checks OK`)
