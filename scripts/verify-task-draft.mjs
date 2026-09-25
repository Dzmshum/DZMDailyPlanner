import assert from 'node:assert/strict'
import {
  QUICK_CAPTURE_DRAFT_KEY,
  TASK_DRAFT_NEW_KEY,
  clearTaskDraft,
  isDraftDirty,
  loadTaskDraft,
  saveTaskDraft,
  taskEditDraftKey,
} from '../src/lib/taskDraft.ts'

const mem = new Map()
const storage = {
  getItem: (key) => (mem.has(key) ? mem.get(key) : null),
  setItem: (key, value) => mem.set(key, value),
  removeItem: (key) => mem.delete(key),
}

let checks = 0
function ok(cond, msg) {
  assert.ok(cond, msg)
  checks += 1
}

saveTaskDraft(TASK_DRAFT_NEW_KEY, { title: 'Черновик', storageTaskId: 'a' }, storage)
ok(loadTaskDraft(TASK_DRAFT_NEW_KEY, storage).title === 'Черновик', 'new draft roundtrip')
clearTaskDraft(TASK_DRAFT_NEW_KEY, storage)
ok(loadTaskDraft(TASK_DRAFT_NEW_KEY, storage) === null, 'clear new draft')

saveTaskDraft(QUICK_CAPTURE_DRAFT_KEY, { title: 'быстро' }, storage)
ok(loadTaskDraft(QUICK_CAPTURE_DRAFT_KEY, storage).title === 'быстро', 'quick draft')

const editKey = taskEditDraftKey('task-1')
saveTaskDraft(editKey, { notes: 'x' }, storage)
ok(loadTaskDraft(editKey, storage).notes === 'x', 'edit draft key')
ok(isDraftDirty('a', 'b'), 'dirty when different')
ok(!isDraftDirty('a', 'a'), 'clean when same')

const throwing = {
  getItem: () => null,
  setItem: () => {
    throw new Error('quota')
  },
  removeItem: () => {},
}
saveTaskDraft('quota-key', { title: 'x' }, throwing)
ok(true, 'save survives quota')

const taskForm = await import('node:fs').then((fs) =>
  fs.readFileSync(new URL('../src/components/tasks/TaskForm.tsx', import.meta.url), 'utf8'),
)
ok(taskForm.includes('keepAndClose'), 'overlay keeps task draft')
ok(taskForm.includes('clearTaskDraft'), 'save/discard clears task draft')
const quick = await import('node:fs').then((fs) =>
  fs.readFileSync(new URL('../src/components/ui/QuickCaptureModal.tsx', import.meta.url), 'utf8'),
)
ok(quick.includes('QUICK_CAPTURE_DRAFT_KEY'), 'quick capture uses draft key')

console.log(`verify-task-draft: ${checks} checks OK`)
