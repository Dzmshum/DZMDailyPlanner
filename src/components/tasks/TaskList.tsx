import type { Task } from '../../types'
import { TaskCard } from './TaskCard'
import { EmptyState } from '../ui/EmptyState'

interface TaskListProps {
  tasks: Task[]
  emptyTitle?: string
  emptyText?: string
  showDeadline?: boolean
  overdue?: boolean
  subdued?: boolean
  draggableInbox?: boolean
}

export function TaskList({
  tasks,
  emptyTitle = 'Нет задач',
  emptyText,
  showDeadline = true,
  overdue = false,
  subdued = false,
  draggableInbox = false,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} text={emptyText} />
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          showDeadline={showDeadline}
          overdue={overdue}
          subdued={subdued}
          draggable={draggableInbox && !task.deadline}
        />
      ))}
    </div>
  )
}
