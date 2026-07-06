import type { Task } from '../../types'
import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { confirmAction } from '../../store/confirmStore'
import { getProjectById } from '../../lib/selectors'
import { formatDisplayDate, formatShortDate } from '../../lib/dates'
import { ProjectBadge } from '../projects/ProjectBadge'
import { TaskCompleteToggle } from './TaskCompleteToggle'
import { UiIcon } from '../ui/UiIcon'
import { isClickSuppressed } from '../../lib/suppressClickThrough'
import { TaskAttachmentPreview } from './TaskAttachmentPreview'

interface TaskCardProps {
  task: Task
  showDeadline?: boolean
  overdue?: boolean
  subdued?: boolean
  draggable?: boolean
  onDragStateChange?: (id: string | null) => void
}

async function confirmDeleteTask(title: string): Promise<boolean> {
  return confirmAction({
    title: 'Удалить задачу?',
    message: `«${title}» будет удалена без возможности восстановления.`,
    confirmLabel: 'Удалить',
    danger: true,
  })
}

export function TaskCard({
  task,
  showDeadline = true,
  overdue = false,
  subdued = false,
  draggable = false,
  onDragStateChange,
}: TaskCardProps) {
  const projects = usePlanStore((s) => s.data.projects)
  const selectedTaskId = usePlanStore((s) => s.selectedTaskId)
  const setSelected = (id: string | null) =>
    usePlanStore.setState({ selectedTaskId: id })
  const openEditTask = usePlanStore((s) => s.openEditTask)
  const toggleTaskDone = usePlanStore((s) => s.toggleTaskDone)
  const deleteTask = usePlanStore((s) => s.deleteTask)
  const didDragRef = useRef(false)

  const project = getProjectById(projects, task.projectId)
  const isDone = task.status === 'done'
  const hasNotes = Boolean(task.notes.trim())
  const attachmentCount = task.attachments?.length ?? 0
  const hasMedia = attachmentCount > 0
  const hasPreview = hasNotes || hasMedia
  const primaryAttachment = hasMedia ? task.attachments[0] : null

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation()
    if (await confirmDeleteTask(task.title)) {
      deleteTask(task.id)
      if (selectedTaskId === task.id) {
        setSelected(null)
      }
    }
  }

  return (
    <article
      className={[
        'task-card',
        `task-card--priority-${task.priority}`,
        `task-card--status-${task.status}`,
        selectedTaskId === task.id ? 'selected' : '',
        overdue ? 'overdue' : '',
        isDone ? 'is-done' : '',
        subdued ? 'subdued' : '',
        draggable ? 'is-draggable' : '',
        hasPreview ? 'has-preview' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return
        didDragRef.current = true
        onDragStateChange?.(task.id)
        e.dataTransfer.setData('text/task-id', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => {
        onDragStateChange?.(null)
        setTimeout(() => {
          didDragRef.current = false
        }, 0)
      }}
      onClick={() => {
        if (didDragRef.current || isClickSuppressed()) return
        setSelected(task.id)
        openEditTask(task.id)
      }}
    >
      <div className="task-card-rail" aria-hidden />

      <TaskCompleteToggle
        checked={isDone}
        status={task.status}
        taskTitle={task.title}
        onToggle={() => toggleTaskDone(task.id)}
      />

      <div className="task-card-content">
        <header className="task-card-header">
          <h3 className={`task-title ${isDone ? 'done' : ''}`}>{task.title}</h3>
        </header>

        {hasPreview && (
          <div
            className={`task-card-preview ${hasMedia && hasNotes ? 'task-card-preview--both' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hasMedia && primaryAttachment && (
              <div className="task-card-preview-media">
                <TaskAttachmentPreview
                  taskId={task.id}
                  attachment={primaryAttachment}
                />
                {attachmentCount > 1 && (
                  <span className="task-card-preview-media-more">+{attachmentCount - 1}</span>
                )}
              </div>
            )}
            {hasNotes && (
              <p className="task-card-preview-notes">{task.notes.trim()}</p>
            )}
          </div>
        )}

        <footer className="task-card-footer">
          <div className="task-card-chips">
            <ProjectBadge project={project} />
            <span className={`task-chip task-chip--status status-${task.status}`}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className={`task-chip task-chip--priority priority-${task.priority}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {(task.time || (showDeadline && task.deadline)) && (
            <div className="task-card-when">
              {task.time && (
                <span className="task-chip task-chip--time">
                  {task.time.start}–{task.time.end}
                </span>
              )}
              {showDeadline && task.deadline && (
                <span
                  className={`task-chip task-chip--deadline ${overdue ? 'is-overdue' : ''}`}
                >
                  {formatShortDate(task.deadline)}
                </span>
              )}
            </div>
          )}
        </footer>
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-icon task-card-delete"
        onClick={(e) => void handleDelete(e)}
        title="Удалить задачу"
        aria-label="Удалить задачу"
      >
        <UiIcon icon="close" size="sm" />
      </button>
    </article>
  )
}

export function TaskCardHistory({ task }: { task: Task }) {
  const projects = usePlanStore((s) => s.data.projects)
  const project = getProjectById(projects, task.projectId)
  const restoreTask = usePlanStore((s) => s.restoreTask)
  const openEditTask = usePlanStore((s) => s.openEditTask)
  const deleteTask = usePlanStore((s) => s.deleteTask)
  const attachmentCount = task.attachments?.length ?? 0
  const hasNotes = Boolean(task.notes.trim())
  const hasMedia = attachmentCount > 0
  const hasPreview = hasNotes || hasMedia
  const primaryAttachment = hasMedia ? task.attachments[0] : null

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation()
    if (
      await confirmAction({
        title: 'Удалить навсегда?',
        message: `«${task.title}» будет удалена из истории.`,
        confirmLabel: 'Удалить',
        danger: true,
      })
    ) {
      deleteTask(task.id)
    }
  }

  return (
    <article
      className="task-card is-done subdued task-card--status-done"
      onClick={() => openEditTask(task.id)}
    >
      <div className="task-card-rail" aria-hidden />
      <TaskCompleteToggle
        checked
        status="done"
        taskTitle={task.title}
        onToggle={() => restoreTask(task.id)}
      />
      <div className="task-card-content">
        <header className="task-card-header">
          <h3 className="task-title done">{task.title}</h3>
        </header>

        {hasPreview && (
          <div
            className={`task-card-preview ${hasMedia && hasNotes ? 'task-card-preview--both' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hasMedia && primaryAttachment && (
              <div className="task-card-preview-media">
                <TaskAttachmentPreview
                  taskId={task.id}
                  attachment={primaryAttachment}
                />
                {attachmentCount > 1 && (
                  <span className="task-card-preview-media-more">+{attachmentCount - 1}</span>
                )}
              </div>
            )}
            {hasNotes && (
              <p className="task-card-preview-notes">{task.notes.trim()}</p>
            )}
          </div>
        )}

        <footer className="task-card-footer">
          <div className="task-card-chips">
            <ProjectBadge project={project} />
            {task.completedAt && (
              <span className="task-chip task-chip--muted">
                {formatDisplayDate(task.completedAt)}
              </span>
            )}
          </div>
        </footer>
      </div>
      <div className="task-card-actions">
        <button
          type="button"
          className="btn btn-sm"
          onClick={(e) => {
            e.stopPropagation()
            restoreTask(task.id)
          }}
          title="Вернуть в активные задачи"
        >
          Вернуть
        </button>
        <button
          type="button"
          className="btn btn-sm btn-danger-outline"
          onClick={(e) => void handleDelete(e)}
          title="Удалить навсегда"
        >
          Удалить
        </button>
      </div>
    </article>
  )
}
