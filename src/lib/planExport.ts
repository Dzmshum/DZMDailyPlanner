import type { PlanData } from '../types'

/** Strip secrets before sharing plan JSON (file export / download). */
export function redactPlanForExport(data: PlanData): PlanData {
  return {
    ...data,
    settings: {
      ...data.settings,
      jira: {
        ...data.settings.jira,
        apiToken: '',
      },
    },
  }
}
