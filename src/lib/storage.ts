import type { PlanData } from '../types'
import { createDefaultPlan, normalizePlan } from '../types'
import { mergePlans } from './planMerge'
import { getElectronApi, isElectron } from './electron'

const STORAGE_KEY = 'planboard-plan'
const LEGACY_STORAGE_KEYS = ['doomplanner-plan']

let devFileApiAvailable: boolean | null = null

async function hasDevFileApi(): Promise<boolean> {
  if (!import.meta.env.DEV) return false
  if (devFileApiAvailable !== null) return devFileApiAvailable
  try {
    const res = await fetch('/api/plan/path')
    devFileApiAvailable = res.ok
  } catch {
    devFileApiAvailable = false
  }
  return devFileApiAvailable
}

async function loadFromDevFileApi(): Promise<PlanData> {
  const res = await fetch('/api/plan')
  if (!res.ok) throw new Error('Не удалось загрузить план')
  const raw = await res.text()
  return normalizePlan(JSON.parse(raw) as PlanData)
}

async function saveToDevFileApi(data: PlanData): Promise<void> {
  const res = await fetch('/api/plan', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data, null, 2),
  })
  if (!res.ok) throw new Error('Не удалось сохранить план')
}

function loadFromLocalStorage(): PlanData | null {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    const stored = localStorage.getItem(key)
    if (!stored) continue
    try {
      const plan = normalizePlan(JSON.parse(stored) as PlanData)
      if (key !== STORAGE_KEY) {
        localStorage.setItem(STORAGE_KEY, stored)
        localStorage.removeItem(key)
      }
      return plan
    } catch {
      localStorage.removeItem(key)
    }
  }
  return null
}

/** Перенос старых данных из localStorage в общий файл (один раз). */
async function migrateLocalStorageIfNeeded(filePlan: PlanData): Promise<PlanData> {
  const local = loadFromLocalStorage()
  if (!local || local.tasks.length === 0) return filePlan

  let merged = filePlan

  if (filePlan.tasks.length === 0 && filePlan.projects.length === 0) {
    merged = local
  } else if (local.tasks.length > 0) {
    merged = mergePlans(filePlan, local)
  }

  await saveToDevFileApi(merged)
  localStorage.removeItem(STORAGE_KEY)
  return merged
}

export async function loadPlanFromDisk(): Promise<PlanData> {
  if (isElectron()) {
    const raw = await getElectronApi().loadPlan()
    return normalizePlan(JSON.parse(raw) as PlanData)
  }

  if (await hasDevFileApi()) {
    let data = await loadFromDevFileApi()
    data = await migrateLocalStorageIfNeeded(data)
    return data
  }

  return loadFromLocalStorage() ?? createDefaultPlan()
}

export async function savePlanToDisk(data: PlanData): Promise<void> {
  const json = JSON.stringify(data, null, 2)

  if (isElectron()) {
    await getElectronApi().savePlan(json)
    return
  }

  if (await hasDevFileApi()) {
    await saveToDevFileApi(data)
    return
  }

  localStorage.setItem(STORAGE_KEY, json)
}

export async function exportPlanToFile(data: PlanData): Promise<void> {
  const json = JSON.stringify(data, null, 2)

  if (isElectron()) {
    await getElectronApi().exportPlan(json)
    return
  }

  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plan-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

export async function pickPlanFileContent(): Promise<{
  content: string
  fileName?: string
} | null> {
  if (isElectron()) {
    const result = await getElectronApi().importPlan()
    if (!result) return null
    return {
      content: result.content,
      fileName: result.filePath.split(/[/\\]/).pop(),
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      void file
        .text()
        .then((content) => resolve({ content, fileName: file.name }))
        .catch(() => resolve(null))
    }
    input.click()
  })
}

export async function getPlanFilePath(): Promise<string | null> {
  if (isElectron()) {
    try {
      return await getElectronApi().getPlanPath()
    } catch {
      return null
    }
  }

  if (await hasDevFileApi()) {
    try {
      const res = await fetch('/api/plan/path')
      if (!res.ok) return null
      return await res.text()
    } catch {
      return null
    }
  }

  return null
}

export function parsePlanJson(raw: string): PlanData {
  return normalizePlan(JSON.parse(raw) as PlanData)
}

export async function usesSharedPlanFile(): Promise<boolean> {
  if (isElectron()) return true
  return hasDevFileApi()
}
