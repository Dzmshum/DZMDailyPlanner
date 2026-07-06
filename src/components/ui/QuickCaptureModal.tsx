import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { TaskAttachment } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { canSaveTask, resolveTaskTitle } from '../../lib/taskTitle'
import { cleanupDraftAttachments } from '../../lib/attachmentCleanup'
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
    setTitle('')
    setAttachments([])
    setStorageTaskId(uuidv4())
  }, [open])

  const handleClose = () => {
    if (!savedRef.current) {
      void cleanupDraftAttachments(
        storageTaskIdRef.current,
        [],
        attachmentsRef.current,
        true,
      )
    }
    setTitle('')
    setAttachments([])
    closeQuickCapture()
  }

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!canSaveTask(title, attachments)) return

    savedRef.current = true
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
      onClose={handleClose}
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
