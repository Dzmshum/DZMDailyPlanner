import { v4 as uuidv4 } from 'uuid'
import type { TaskAttachment } from '../types'
import { getElectronApi, isElectron } from './electron'
import { base64ToBlob, blobToBase64, compressImageFile } from './imageCompress'

const IDB_NAME = 'planboard-attachments'
const LEGACY_IDB_NAME = 'doomplanner-attachments'
const IDB_STORE = 'blobs'

let devFileApiAvailable: boolean | null = null
const blobUrlCache = new Map<string, string>()
let legacyIdbMigrated = false

function cacheKey(taskId: string, fileName: string): string {
  return `${taskId}/${fileName}`
}

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

function openIdbByName(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB error'))
  })
}

async function migrateLegacyIdbIfNeeded(): Promise<void> {
  if (legacyIdbMigrated) return
  legacyIdbMigrated = true

  let legacyDb: IDBDatabase
  try {
    legacyDb = await openIdbByName(LEGACY_IDB_NAME)
  } catch {
    return
  }

  const entries = await new Promise<Array<{ key: string; blob: Blob }>>((resolve, reject) => {
    const items: Array<{ key: string; blob: Blob }> = []
    const tx = legacyDb.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return
      items.push({ key: String(cursor.key), blob: cursor.value as Blob })
      cursor.continue()
    }
    tx.oncomplete = () => resolve(items)
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read error'))
  })
  legacyDb.close()

  if (entries.length === 0) return

  const db = await openIdbByName(IDB_NAME)
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)
    for (const { key, blob } of entries) {
      store.put(blob, key)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write error'))
  })
  db.close()
}

function openIdb(): Promise<IDBDatabase> {
  return migrateLegacyIdbIfNeeded().then(() => openIdbByName(IDB_NAME))
}

async function idbPut(key: string, blob: Blob): Promise<void> {
  const db = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(blob, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write error'))
  })
  db.close()
}

async function idbGet(key: string): Promise<Blob | null> {
  const db = await openIdb()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(key)
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB read error'))
  })
  db.close()
  return blob
}

async function idbDelete(key: string): Promise<void> {
  const db = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete error'))
  })
  db.close()
}

async function idbDeletePrefix(prefix: string): Promise<void> {
  const db = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) return
      const key = String(cursor.key)
      if (key.startsWith(prefix)) {
        cursor.delete()
      }
      cursor.continue()
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete error'))
  })
  db.close()
}

async function persistBlob(
  taskId: string,
  fileName: string,
  base64: string,
): Promise<void> {
  if (isElectron()) {
    await getElectronApi().saveAttachment(taskId, fileName, base64)
    return
  }

  if (await hasDevFileApi()) {
    const res = await fetch(
      `/api/attachments/${encodeURIComponent(taskId)}/${encodeURIComponent(fileName)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64 }),
      },
    )
    if (!res.ok) throw new Error('Не удалось сохранить вложение')
    return
  }

  const blob = base64ToBlob(base64, 'image/jpeg')
  await idbPut(cacheKey(taskId, fileName), blob)
}

async function readBlob(taskId: string, fileName: string): Promise<Blob> {
  if (isElectron()) {
    const base64 = await getElectronApi().readAttachment(taskId, fileName)
    return base64ToBlob(base64, 'image/jpeg')
  }

  if (await hasDevFileApi()) {
    const res = await fetch(
      `/api/attachments/${encodeURIComponent(taskId)}/${encodeURIComponent(fileName)}`,
    )
    if (!res.ok) throw new Error('Вложение не найдено')
    const json = (await res.json()) as { data: string }
    return base64ToBlob(json.data, 'image/jpeg')
  }

  const blob = await idbGet(cacheKey(taskId, fileName))
  if (!blob) throw new Error('Вложение не найдено')
  return blob
}

async function removeBlob(taskId: string, fileName: string): Promise<void> {
  revokeAttachmentUrl(taskId, fileName)

  if (isElectron()) {
    await getElectronApi().deleteAttachment(taskId, fileName)
    return
  }

  if (await hasDevFileApi()) {
    const res = await fetch(
      `/api/attachments/${encodeURIComponent(taskId)}/${encodeURIComponent(fileName)}`,
      { method: 'DELETE' },
    )
    if (!res.ok) throw new Error('Не удалось удалить вложение')
    return
  }

  await idbDelete(cacheKey(taskId, fileName))
}

export async function removeTaskAttachment(
  taskId: string,
  fileName: string,
): Promise<void> {
  await removeBlob(taskId, fileName)
}

export async function deleteTaskAttachments(taskId: string): Promise<void> {
  for (const key of [...blobUrlCache.keys()]) {
    if (key.startsWith(`${taskId}/`)) {
      URL.revokeObjectURL(blobUrlCache.get(key)!)
      blobUrlCache.delete(key)
    }
  }

  if (isElectron()) {
    await getElectronApi().deleteTaskAttachments(taskId)
    return
  }

  if (await hasDevFileApi()) {
    const res = await fetch(`/api/attachments/${encodeURIComponent(taskId)}`, {
      method: 'DELETE',
    })
    if (!res.ok && res.status !== 404) {
      throw new Error('Не удалось удалить вложения задачи')
    }
    return
  }

  await idbDeletePrefix(`${taskId}/`)
}

export async function saveTaskAttachment(
  taskId: string,
  file: File,
): Promise<TaskAttachment> {
  const blob = await compressImageFile(file)
  const id = uuidv4()
  const fileName = `${id}.jpg`
  const base64 = await blobToBase64(blob)

  const attachment: TaskAttachment = {
    id,
    name: file.name,
    mimeType: 'image/jpeg',
    fileName,
  }

  await persistBlob(taskId, fileName, base64)
  return attachment
}

export async function getAttachmentBlobUrl(
  taskId: string,
  attachment: TaskAttachment,
): Promise<string> {
  const key = cacheKey(taskId, attachment.fileName)
  const cached = blobUrlCache.get(key)
  if (cached) return cached

  const blob = await readBlob(taskId, attachment.fileName)
  const url = URL.createObjectURL(blob)
  blobUrlCache.set(key, url)
  return url
}

export function revokeAttachmentUrl(taskId: string, fileName: string): void {
  const key = cacheKey(taskId, fileName)
  const url = blobUrlCache.get(key)
  if (url) {
    URL.revokeObjectURL(url)
    blobUrlCache.delete(key)
  }
}
