import type { TaskAttachment } from '../types'

export function resolveTaskTitle(
  title: string,
  attachments: TaskAttachment[],
): string {
  const trimmed = title.trim()
  if (trimmed) return trimmed
  if (attachments.length === 0) return ''

  const baseName = attachments[0].name.replace(/\.[^.]+$/, '').trim()
  return baseName || 'Фото'
}

export function canSaveTask(title: string, attachments: TaskAttachment[]): boolean {
  return Boolean(title.trim()) || attachments.length > 0
}
