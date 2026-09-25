import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addDays } from 'date-fns'
import type { Priority, TaskAttachment, TaskStatus } from '../../types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { formatDate, today } from '../../lib/dates'
import { exportTaskToJira, isJiraConfigured } from '../../lib/jira'
import { canSaveTask, resolveTaskTitle } from '../../lib/taskTitle'
import {
  applyAttachmentRemovals,
  cleanupDraftAttachments,
} from '../../lib/attachmentCleanup'
import { confirmAction } from '../../store/confirmStore'
import {
  TASK_DRAFT_NEW_KEY,
  clearTaskDraft,
  loadTaskDraft,
  saveTaskDraft,
  taskEditDraftKey,
} from '../../lib/taskDraft'
import { VoiceInputField } from '../ui/VoiceInputField'
import { Modal } from '../ui/Modal'
import { DatePicker } from '../ui/DatePicker'
import { ProjectSelect } from './ProjectSelect'
import { TaskAttachments } from './TaskAttachments'

type DeadlinePreset = 'today' | 'tomorrow' | 'none' | 'custom'

function getDeadlinePreset(deadline: string): DeadlinePreset {
  if (!deadline) return 'none'
  const todayStr = formatDate(today())
  const tomorrowStr = formatDate(addDays(today(), 1))
  if (deadline === todayStr) return 'today'
  if (deadline === tomorrowStr) return 'tomorrow'
  return 'custom'
}

export function TaskForm() {
  const open = usePlanStore((s) => s.taskFormOpen)
  const editingId = usePlanStore((s) => s.editingTaskId)
  const tasks = usePlanStore((s) => s.data.tasks)
  const jiraSettings = usePlanStore((s) => s.data.settings.jira)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const closeTaskForm = usePlanStore((s) => s.closeTaskForm)
  const addTask = usePlanStore((s) => s.addTask)
  const updateTask = usePlanStore((s) => s.updateTask)
  const deleteTask = usePlanStore((s) => s.deleteTask)

  const editingTask = editingId ? tasks.find((t) => t.id === editingId) : null
  const isEditing = Boolean(editingId)

  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [deadline, setDeadline] = useState('')
  const [deadlinePreset, setDeadlinePreset] = useState<DeadlinePreset>('today')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [notes, setNotes] = useState('')
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [storageTaskId, setStorageTaskId] = useState('')
  const [jiraKey, setJiraKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [jiraLoading, setJiraLoading] = useState(false)
  const [jiraMessage, setJiraMessage] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const initialAttachmentsRef = useRef<TaskAttachment[]>([])
  const sessionRef = useRef<string | null>(null)

  const draftKey = editingId ? taskEditDraftKey(editingId) : TASK_DRAFT_NEW_KEY

  const snapshot = () =>
    JSON.stringify({
      title,
      projectId,
      deadline,
      timeStart,
      timeEnd,
      priority,
      status,
      notes,
      attachments,
      storageTaskId,
      jiraKey,
    })

  useEffect(() => {
    if (!open) {
      sessionRef.current = null
      return
    }
    const session = editingId ?? 'new'
    if (sessionRef.current === session) return
    sessionRef.current = session

    const saved = loadTaskDraft<{
      title: string
      projectId: string
      deadline: string
      timeStart: string
      timeEnd: string
      priority: Priority
      status: TaskStatus
      notes: string
      attachments: TaskAttachment[]
      storageTaskId: string
      jiraKey: string | null
    }>(draftKey)

    if (saved) {
      initialAttachmentsRef.current = editingTask?.attachments ?? []
      setTitle(saved.title)
      setProjectId(saved.projectId)
      setDeadline(saved.deadline)
      setDeadlinePreset(getDeadlinePreset(saved.deadline))
      setTimeStart(saved.timeStart)
      setTimeEnd(saved.timeEnd)
      setPriority(saved.priority)
      setStatus(saved.status)
      setNotes(saved.notes)
      setAttachments(saved.attachments ?? [])
      setStorageTaskId(saved.storageTaskId || editingTask?.id || uuidv4())
      setJiraKey(saved.jiraKey)
      setShowDetails(Boolean(editingTask) || Boolean(saved.notes))
      setError('')
      setJiraMessage('')
      return
    }

    if (editingTask) {
      const initial = editingTask.attachments ?? []
      initialAttachmentsRef.current = initial
      setTitle(editingTask.title)
      setProjectId(editingTask.projectId ?? '')
      const dl = editingTask.deadline ?? ''
      setDeadline(dl)
      setDeadlinePreset(getDeadlinePreset(dl))
      setTimeStart(editingTask.time?.start ?? '')
      setTimeEnd(editingTask.time?.end ?? '')
      setPriority(editingTask.priority)
      setStatus(editingTask.status)
      setNotes(editingTask.notes)
      setAttachments(editingTask.attachments ?? [])
      setStorageTaskId(editingTask.id)
      setJiraKey(editingTask.jiraKey)
      setShowDetails(true)
    } else {
      initialAttachmentsRef.current = []
      setTitle('')
      setProjectId('')
      setDeadline(formatDate(today()))
      setDeadlinePreset('today')
      setTimeStart('')
      setTimeEnd('')
      setPriority('medium')
      setStatus('todo')
      setNotes('')
      setAttachments([])
      setStorageTaskId(uuidv4())
      setJiraKey(null)
      setShowDetails(false)
    }
    setError('')
    setJiraMessage('')
  }, [open, editingId, editingTask, draftKey])

  useEffect(() => {
    if (!open || !storageTaskId) return
    const timer = window.setTimeout(() => {
      saveTaskDraft(draftKey, JSON.parse(snapshot()))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [open, draftKey, title, projectId, deadline, timeStart, timeEnd, priority, status, notes, attachments, storageTaskId, jiraKey])

  const buildPayload = () => {
    const time =
      timeStart && timeEnd ? { start: timeStart, end: timeEnd } : null

    return {
      title: resolveTaskTitle(title, attachments),
      projectId: projectId || null,
      deadline: deadline || null,
      time,
      priority,
      status,
      notes: notes.trim(),
      attachments,
      jiraKey,
    }
  }

  const keepAndClose = () => {
    saveTaskDraft(draftKey, JSON.parse(snapshot()))
    closeTaskForm()
  }

  const discardAndClose = async () => {
    const dirty = title.trim() !== '' || notes.trim() !== '' || attachments.length > 0
    if (
      dirty &&
      !(await confirmAction({
        title: 'Сбросить черновик?',
        message: 'Ввод и черновые фото будут удалены.',
        confirmLabel: 'Сбросить',
        danger: true,
      }))
    ) {
      return
    }
    void cleanupDraftAttachments(
      storageTaskId,
      initialAttachmentsRef.current,
      attachments,
      !isEditing,
    )
    clearTaskDraft(draftKey)
    closeTaskForm()
  }

  useEffect(() => {
    if (!open) return
    const onEscCancel = () => keepAndClose()
    window.addEventListener('planboard:cancel-task-form', onEscCancel)
    return () =>
      window.removeEventListener('planboard:cancel-task-form', onEscCancel)
  })

  const handleSave = async () => {
    if (!canSaveTask(title, attachments)) {
      setError('Введите название или добавьте фото')
      return
    }

    const payload = buildPayload()

    if (editingId) {
      await applyAttachmentRemovals(
        editingId,
        initialAttachmentsRef.current,
        attachments,
      )
      updateTask(editingId, payload)
    } else {
      addTask({ ...payload, id: storageTaskId })
    }
    clearTaskDraft(draftKey)
    closeTaskForm()
  }

  const applyDeadlinePreset = (preset: DeadlinePreset) => {
    setDeadlinePreset(preset)
    if (preset === 'today') setDeadline(formatDate(today()))
    else if (preset === 'tomorrow') setDeadline(formatDate(addDays(today(), 1)))
    else if (preset === 'none') setDeadline('')
    else setDeadlinePreset('custom')
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSave()
    }
  }

  const handleDelete = async () => {
    if (
      editingId &&
      (await confirmAction({
        title: 'Удалить задачу?',
        message: 'Задача будет удалена без возможности восстановления.',
        confirmLabel: 'Удалить',
        danger: true,
      }))
    ) {
      deleteTask(editingId)
      closeTaskForm()
    }
  }

  const handleJiraExport = async () => {
    if (!canSaveTask(title, attachments)) {
      setError('Сначала укажите название или добавьте фото')
      return
    }

    const taskForExport = {
      id: editingId ?? 'draft',
      ...buildPayload(),
      createdAt: editingTask?.createdAt ?? new Date().toISOString(),
      completedAt: editingTask?.completedAt ?? null,
    }

    setJiraLoading(true)
    setJiraMessage('')
    try {
      const result = await exportTaskToJira(taskForExport, jiraSettings)
      setJiraKey(result.issueKey)
      setJiraMessage(`Создано: ${result.issueKey}`)
      if (editingId) {
        updateTask(editingId, { jiraKey: result.issueKey })
      }
      window.open(result.issueUrl, '_blank')
    } catch (err) {
      setJiraMessage(err instanceof Error ? err.message : 'Ошибка экспорта в Jira')
    } finally {
      setJiraLoading(false)
    }
  }

  const jiraReady = isJiraConfigured(jiraSettings)

  return (
    <Modal
      open={open}
      onClose={keepAndClose}
      title={isEditing ? 'Редактировать задачу' : 'Новая задача'}
      size="lg"
      footer={
        <>
          {isEditing && (
            <button
              className="btn btn-danger-outline"
              style={{ marginRight: 'auto' }}
              onClick={() => void handleDelete()}
            >
              Удалить
            </button>
          )}
          <button className="btn" onClick={() => void discardAndClose()}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={() => void handleSave()}>
            {isEditing ? 'Сохранить' : 'Создать'}
          </button>
        </>
      }
    >
      <div className={showDetails ? 'task-form-grid' : 'task-form-quick'}>
        <div className="task-form-main">
          <div className="form-group">
            <label className="form-label">Название</label>
            <VoiceInputField
              value={title}
              onChange={setTitle}
              voiceEnabled={voiceInputEnabled}
              inputClassName="form-input-lg"
              placeholder="Что нужно сделать?"
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
            {!isEditing && (
              <p className="form-hint">
                Enter — создать · можно только фото · Подробнее — доп. поля
              </p>
            )}
          </div>

          {storageTaskId && (
            <TaskAttachments
              taskId={storageTaskId}
              attachments={attachments}
              onChange={setAttachments}
              compact={!showDetails && !isEditing}
              deferDiskDelete={isEditing}
            />
          )}

          {showDetails && (
            <>
              <div className="form-group">
                <label className="form-label">Проект</label>
                <ProjectSelect value={projectId} onChange={setProjectId} />
              </div>

              <div className="form-group">
                <label className="form-label">Заметки</label>
                <VoiceInputField
                  multiline
                  value={notes}
                  onChange={setNotes}
                  voiceEnabled={voiceInputEnabled}
                  placeholder="Дополнительные детали..."
                  rows={3}
                />
              </div>

              {jiraReady && (
                <div className="task-form-jira">
                  <div className="form-label">Jira</div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => void handleJiraExport()}
                    disabled={jiraLoading}
                  >
                    {jiraLoading ? 'Экспорт...' : '→ Создать в Jira'}
                  </button>
                  {jiraMessage && (
                    <p
                      className={`form-hint ${jiraMessage.startsWith('Создано') ? 'form-success' : 'form-error'}`}
                    >
                      {jiraMessage}
                    </p>
                  )}
                  {jiraKey && <p className="form-hint">Ключ: {jiraKey}</p>}
                </div>
              )}
            </>
          )}

          {!showDetails && !isEditing && (
            <button
              type="button"
              className="btn btn-ghost task-form-more"
              onClick={() => setShowDetails(true)}
            >
              Подробнее — проект, заметки, время...
            </button>
          )}
        </div>

        <div className="task-form-side">
          <div className="form-group">
            <label className="form-label">Дедлайн</label>
            <div className="deadline-chips">
              <button
                type="button"
                className={`chip ${deadlinePreset === 'today' ? 'active' : ''}`}
                onClick={() => applyDeadlinePreset('today')}
              >
                Сегодня
              </button>
              <button
                type="button"
                className={`chip ${deadlinePreset === 'tomorrow' ? 'active' : ''}`}
                onClick={() => applyDeadlinePreset('tomorrow')}
              >
                Завтра
              </button>
              <button
                type="button"
                className={`chip ${deadlinePreset === 'none' ? 'active' : ''}`}
                onClick={() => applyDeadlinePreset('none')}
              >
                Без даты
              </button>
            </div>
            {(deadlinePreset === 'custom' || showDetails) && (
              <div className="deadline-picker-wrap">
                <DatePicker
                  value={deadline}
                  onChange={(value) => {
                    setDeadline(value)
                    setDeadlinePreset(getDeadlinePreset(value))
                  }}
                />
              </div>
            )}
            {deadlinePreset !== 'custom' && !showDetails && deadline && (
              <button
                type="button"
                className="btn btn-ghost btn-sm deadline-custom-btn"
                onClick={() => setDeadlinePreset('custom')}
              >
                Другая дата...
              </button>
            )}
          </div>

          {(showDetails || isEditing) && (
            <>
              <div className="form-group">
                <label className="form-label">Приоритет</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <div className="form-group">
                  <label className="form-label">Статус</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  >
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Начало</label>
                  <input
                    type="time"
                    className="form-input"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Конец</label>
                  <input
                    type="time"
                    className="form-input"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
