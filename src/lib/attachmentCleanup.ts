import type { TaskAttachment } from '../types'
import { deleteTaskAttachments, removeTaskAttachment } from './attachmentStorage'

export function getAddedAttachments(
  initial: TaskAttachment[],
  current: TaskAttachment[],
): TaskAttachment[] {
  const initialIds = new Set(initial.map((a) => a.id))
  return current.filter((a) => !initialIds.has(a.id))
}

export function getRemovedAttachments(
  initial: TaskAttachment[],
  current: TaskAttachment[],
): TaskAttachment[] {
  const currentIds = new Set(current.map((a) => a.id))
  return initial.filter((a) => !currentIds.has(a.id))
}

/** Откат несохранённых вложений при закрытии формы без сохранения. */
export async function cleanupDraftAttachments(
  taskId: string,
  initial: TaskAttachment[],
  current: TaskAttachment[],
  isNewTask: boolean,
): Promise<void> {
  if (!taskId) return

  if (isNewTask) {
    if (current.length > 0) {
      await deleteTaskAttachments(taskId).catch(() => {})
    }
    return
  }

  const added = getAddedAttachments(initial, current)
  await Promise.all(
    added.map((a) => removeTaskAttachment(taskId, a.fileName).catch(() => {})),
  )
}

/** Удаление файлов, убранных из задачи при сохранении. */
export async function applyAttachmentRemovals(
  taskId: string,
  initial: TaskAttachment[],
  current: TaskAttachment[],
): Promise<void> {
  const removed = getRemovedAttachments(initial, current)
  await Promise.all(
    removed.map((a) => removeTaskAttachment(taskId, a.fileName).catch(() => {})),
  )
}
