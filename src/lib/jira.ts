import type { JiraSettings, Task } from '../types'
import { getElectronApi, isElectron } from './electron'

function buildDescription(task: Task): string {
  const parts = [task.notes].filter(Boolean)
  if (task.priority) parts.unshift(`Приоритет: ${task.priority}`)
  if (task.deadline) parts.unshift(`Дедлайн: ${task.deadline}`)
  return parts.join('\n\n') || task.title
}

export function isJiraConfigured(settings: JiraSettings): boolean {
  return (
    settings.enabled &&
    settings.baseUrl.trim() !== '' &&
    settings.email.trim() !== '' &&
    settings.apiToken.trim() !== '' &&
    settings.projectKey.trim() !== ''
  )
}

export async function exportTaskToJira(
  task: Task,
  settings: JiraSettings,
) {
  if (!isJiraConfigured(settings)) {
    throw new Error('Заполните настройки Jira в разделе «Настройки»')
  }

  if (!isElectron()) {
    throw new Error(
      'Экспорт в Jira доступен в десктоп-приложении (pnpm electron:dev).',
    )
  }

  const baseUrl = settings.baseUrl.replace(/\/$/, '')

  return getElectronApi().createJiraIssue({
    baseUrl,
    email: settings.email.trim(),
    apiToken: settings.apiToken.trim(),
    projectKey: settings.projectKey.trim().toUpperCase(),
    issueType: settings.issueType.trim() || 'Task',
    summary: task.title,
    description: buildDescription(task),
    deadline: task.deadline,
  })
}
