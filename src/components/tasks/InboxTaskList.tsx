import { useState, type DragEvent } from 'react'
import type { Task } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { TaskCard } from './TaskCard'

interface InboxTaskListProps {
  tasks: Task[]
}

export function InboxTaskList({ tasks }: InboxTaskListProps) {
  const reorderInboxTask = usePlanStore((s) => s.reorderInboxTask)
  const moveTaskDeadline = usePlanStore((s) => s.moveTaskDeadline)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverInbox, setDragOverInbox] = useState(false)

  const handleDropOnTask = (targetId: string, e: DragEvent) => {
    e.preventDefault()
    const activeId = e.dataTransfer.getData('text/task-id') || draggingId
    if (activeId && activeId !== targetId) reorderInboxTask(activeId, targetId)
    setDragOverId(null)
    setDraggingId(null)
  }

  return (
    <div
      className={`inbox-task-list ${dragOverInbox ? 'drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOverInbox(true)
      }}
      onDragLeave={() => setDragOverInbox(false)}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/task-id') || draggingId
        if (id) moveTaskDeadline(id, null)
        setDragOverInbox(false)
        setDraggingId(null)
      }}
    >
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`inbox-task-row ${dragOverId === task.id ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverId(task.id)
          }}
          onDragLeave={() => setDragOverId(null)}
          onDrop={(e) => handleDropOnTask(task.id, e)}
        >
          <TaskCard
            task={task}
            showDeadline={false}
            draggable
            onDragStateChange={setDraggingId}
          />
        </div>
      ))}
    </div>
  )
}
