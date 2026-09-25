import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TaskAttachment } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { canSaveTask, resolveTaskTitle } from '../../lib/taskTitle'
import { cleanupDraftAttachments } from '../../lib/attachmentCleanup'
import { confirmAction } from '../../store/confirmStore'
import {
  QUICK_CAPTURE_DRAFT_KEY,
  clearTaskDraft,
  loadTaskDraft,
  saveTaskDraft,
} from '../../lib/taskDraft'
import { Modal } from '../ui/Modal'
import { VoiceInputField } from '../ui/VoiceInputField'
import { TaskAttachments } from '../tasks/TaskAttachments'

export function QuickCaptureModal() {
  const open = usePlanStore((s) => s.quickCaptureOpen)
  const closeQuickCapture = usePlanStore((s) => s.closeQuickCapture)
  const addTask = usePlanStore((s) => s.addTask)
  const voiceEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)

  const [title, setTitle] = useState('')
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [storageTaskId, setStorageTaskId] = useState('')
  const savedRef = useRef(false)
  const attachmentsRef = useRef(attachments)
  attachmentsRef.current = attachments
  const storageTaskIdRef = useRef(storageTaskId)
  storageTaskIdRef.current = storageTaskId

  useEffect(() => {
    if (!open) return
    savedRef.current = false
    const saved = loadTaskDraft<{ title: string; attachments: TaskAttachment[]; storageTaskId: string }>(
      QUICK_CAPTURE_DRAFT_KEY,
    )
    if (saved?.storageTaskId) {
      setTitle(saved.title ?? '')
      setAttachments(saved.attachments ?? [])
      setStorageTaskId(saved.storageTaskId)
      return
    }
    setTitle('')
    setAttachments([])
    setStorageTaskId(uuidv4())
  }, [open])

  useEffect(() => {
    if (!open || !storageTaskId || savedRef.current) return
    const timer = window.setTimeout(() => {
      saveTaskDraft(QUICK_CAPTURE_DRAFT_KEY, {
        title,
        attachments,
        storageTaskId,
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [open, title, attachments, storageTaskId])

  const keepAndClose = () => {
    saveTaskDraft(QUICK_CAPTURE_DRAFT_KEY, {
      title,
      attachments: attachmentsRef.current,
      storageTaskId: storageTaskIdRef.current,
    })
    closeQuickCapture()
  }

  const discardAndClose = async () => {
    if (
      (title.trim() || attachmentsRef.current.length > 0) &&
      !(await confirmAction({
        title: 'Сбросить черновик?',
        message: 'Текст и черновые фото будут удалены.',
        confirmLabel: 'Сбросить',
        danger: true,
      }))
    ) {
      return
    }
    void cleanupDraftAttachments(storageTaskIdRef.current, [], attachmentsRef.current, true)
    clearTaskDraft(QUICK_CAPTURE_DRAFT_KEY)
    setTitle('')
    setAttachments([])
    closeQuickCapture()
  }

  useEffect(() => {
    if (!open) return
    const onEscCancel = () => keepAndClose()
    window.addEventListener('planboard:cancel-quick-capture', onEscCancel)
    return () =>
      window.removeEventListener('planboard:cancel-quick-capture', onEscCancel)
  })

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!canSaveTask(title, attachments)) return

    savedRef.current = true
    clearTaskDraft(QUICK_CAPTURE_DRAFT_KEY)
    addTask({
      id: storageTaskId,
      title: resolveTaskTitle(title, attachments),
      projectId: null,
      deadline: null,
      time: null,
      priority: 'medium',
      status: 'todo',
      notes: '',
      attachments,
      jiraKey: null,
    })
    setTitle('')
    setAttachments([])
    closeQuickCapture()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSubmit = canSaveTask(title, attachments)

  return (
    <Modal
      open={open}
      onClose={keepAndClose}
      title="Быстрый захват"
      size="md"
    >
      <form onSubmit={handleSubmit} className="quick-capture-form">
        <VoiceInputField
          value={title}
          onChange={setTitle}
          voiceEnabled={voiceEnabled}
          inputClassName="form-input-lg"
          placeholder="Мысль или фото — Enter для сохранения"
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {storageTaskId && (
          <TaskAttachments
            taskId={storageTaskId}
            attachments={attachments}
            onChange={setAttachments}
            compact
          />
        )}

        <div className="quick-capture-actions">
          <button type="button" className="btn" onClick={() => void discardAndClose()}>
            Сбросить
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            Во входящие
          </button>
        </div>
        <p className="form-hint">
          Q / Й — открыть · Ctrl+V — фото из буфера · Ctrl+Shift+V — голос
        </p>
      </form>
    </Modal>
  )
}
