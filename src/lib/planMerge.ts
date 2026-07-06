import type { PlanData } from '../types'
import { normalizePlan } from '../types'

export function mergePlans(current: PlanData, imported: PlanData): PlanData {
  const normalized = normalizePlan(imported)
  const projectIds = new Set(current.projects.map((p) => p.id))
  const taskIds = new Set(current.tasks.map((t) => t.id))

  return normalizePlan({
    version: 1,
    settings: current.settings,
    projects: [
      ...current.projects,
      ...normalized.projects.filter((p) => !projectIds.has(p.id)),
    ],
    tasks: [
      ...current.tasks,
      ...normalized.tasks.filter((t) => !taskIds.has(t.id)),
    ],
  })
}

export function replacePlan(current: PlanData, imported: PlanData): PlanData {
  const normalized = normalizePlan(imported)
  return normalizePlan({
    ...normalized,
    settings: {
      ...normalized.settings,
      jira: {
        ...normalized.settings.jira,
        apiToken:
          normalized.settings.jira.apiToken || current.settings.jira.apiToken,
        email: normalized.settings.jira.email || current.settings.jira.email,
      },
    },
  })
}
