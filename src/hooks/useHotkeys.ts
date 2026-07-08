import { useEffect } from 'react'
import type { ViewId } from '../types'
import { usePlanStore } from '../store/planStore'
import { exportPlanToFile } from '../lib/storage'

const VIEW_ORDER: ViewId[] = [
  'dashboard',
  'agenda',
  'week',
  'inbox',
  'daily',
  'tasks',
  'projects',
  'history',
]

const QUICK_CAPTURE_KEYS = new Set(['q', 'Q', 'й', 'Й'])

export function useHotkeys() {
  const setView = usePlanStore((s) => s.setView)
  const openNewTask = usePlanStore((s) => s.openNewTask)
  const openQuickCapture = usePlanStore((s) => s.openQuickCapture)
  const openExportText = usePlanStore((s) => s.openExportText)
  const closeTaskForm = usePlanStore((s) => s.closeTaskForm)
  const closeQuickCapture = usePlanStore((s) => s.closeQuickCapture)
  const taskFormOpen = usePlanStore((s) => s.taskFormOpen)
  const quickCaptureOpen = usePlanStore((s) => s.quickCaptureOpen)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const selectedTaskId = usePlanStore((s) => s.selectedTaskId)
  const toggleTaskDone = usePlanStore((s) => s.toggleTaskDone)
  const persist = usePlanStore((s) => s.persist)
  const data = usePlanStore((s) => s.data)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (e.key === 'Escape') {
        if (quickCaptureOpen) {
          e.preventDefault()
          closeQuickCapture()
          return
        }
        if (taskFormOpen) {
          e.preventDefault()
          closeTaskForm()
        }
        return
      }

      if (
        voiceInputEnabled &&
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'v'
      ) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('planboard:voice-toggle'))
        return
      }

      if (!isInput && QUICK_CAPTURE_KEYS.has(e.key)) {
        e.preventDefault()
        openQuickCapture()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        openExportText()
        return
      }

      if (isInput && !e.ctrlKey && !e.metaKey) return

      if (e.key === 'n' || e.key === 'N') {
        if (!isInput) {
          e.preventDefault()
          openNewTask()
        }
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        void persist()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        void exportPlanToFile(data)
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const search = document.getElementById('global-search') as HTMLInputElement | null
        search?.focus()
        return
      }

      if (!isInput && e.key >= '1' && e.key <= '8') {
        e.preventDefault()
        const index = parseInt(e.key, 10) - 1
        if (VIEW_ORDER[index]) setView(VIEW_ORDER[index])
        return
      }

      if (!isInput && e.key === ' ' && selectedTaskId) {
        e.preventDefault()
        toggleTaskDone(selectedTaskId)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    setView,
    openNewTask,
    openQuickCapture,
    openExportText,
    closeTaskForm,
    closeQuickCapture,
    taskFormOpen,
    quickCaptureOpen,
    voiceInputEnabled,
    selectedTaskId,
    toggleTaskDone,
    persist,
    data,
  ])
}
