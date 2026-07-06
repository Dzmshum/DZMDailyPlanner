import type { JiraExportResult, WindowMode } from '../types'

export interface ImportPlanResult {
  content: string
  filePath: string
}

export interface DoomPlannerElectronApi {
  loadPlan: () => Promise<string>
  savePlan: (data: string) => Promise<void>
  exportPlan: (data: string) => Promise<void>
  importPlan: () => Promise<ImportPlanResult | null>
  getPlanPath: () => Promise<string>
  windowClose: () => Promise<void>
  windowToggleMaximize: () => Promise<boolean>
  windowIsMaximized: () => Promise<boolean>
  setWindowMode: (mode: WindowMode) => Promise<WindowMode>
  getWindowMode: () => Promise<WindowMode>
  expandToStandard: (taskId?: string | null) => Promise<string | null>
  createJiraIssue: (payload: {
    baseUrl: string
    email: string
    apiToken: string
    projectKey: string
    issueType: string
    summary: string
    description: string
    deadline: string | null
  }) => Promise<JiraExportResult>
  saveAttachment: (
    taskId: string,
    fileName: string,
    base64Data: string,
  ) => Promise<void>
  readAttachment: (taskId: string, fileName: string) => Promise<string>
  deleteAttachment: (taskId: string, fileName: string) => Promise<void>
  deleteTaskAttachments: (taskId: string) => Promise<void>
}

declare global {
  interface Window {
    doomPlanner?: DoomPlannerElectronApi
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.doomPlanner !== undefined
}

export function getElectronApi(): DoomPlannerElectronApi {
  if (!window.doomPlanner) {
    throw new Error('Electron API недоступен')
  }
  return window.doomPlanner
}

export async function applyElectronWindowMode(mode: WindowMode): Promise<void> {
  if (!isElectron()) return
  await getElectronApi().setWindowMode(mode)
}

export async function expandElectronWindow(taskId?: string): Promise<void> {
  if (!isElectron()) return
  await getElectronApi().expandToStandard(taskId ?? null)
}

