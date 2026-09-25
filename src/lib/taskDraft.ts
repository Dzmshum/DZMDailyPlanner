export const TASK_DRAFT_NEW_KEY = 'planboard-task-draft-new'
export const QUICK_CAPTURE_DRAFT_KEY = 'planboard-quick-capture-draft'

export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function taskEditDraftKey(taskId: string): string {
  return `planboard-task-draft-${taskId}`
}

function defaultStorage(): DraftStorage | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    return sessionStorage
  } catch {
    return null
  }
}

export function saveTaskDraft(
  key: string,
  draft: unknown,
  storage: DraftStorage | null = defaultStorage(),
): void {
  try {
    storage?.setItem(key, JSON.stringify(draft))
  } catch {
    // sessionStorage может отказать по квоте — форма всё равно должна закрыться
  }
}

export function loadTaskDraft<T>(
  key: string,
  storage: DraftStorage | null = defaultStorage(),
): T | null {
  const raw = storage?.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearTaskDraft(
  key: string,
  storage: DraftStorage | null = defaultStorage(),
): void {
  storage?.removeItem(key)
}

export function isDraftDirty(current: string, baseline: string): boolean {
  return current !== baseline
}
