import { useState } from 'react'
import type { Task } from '../../types'
import { TaskList } from './TaskList'
import { UiIcon } from '../ui/UiIcon'

interface DoneTasksCollapsibleProps {
  tasks: Task[]
  label?: string
  showDeadline?: boolean
  defaultCollapsed?: boolean
  titleClassName?: string
  overdue?: boolean
  className?: string
}

export function DoneTasksCollapsible({
  tasks,
  label = 'Выполнено',
  showDeadline = false,
  defaultCollapsed = false,
  titleClassName = '',
  overdue = false,
  className = '',
}: DoneTasksCollapsibleProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  if (tasks.length === 0) return null

  return (
    <div className={`done-tasks-collapsible ${className}`.trim()}>
      <button
        type="button"
        className="agenda-done-header"
        onClick={() => setCollapsed((v) => !v)}
      >
        <UiIcon icon={collapsed ? 'chevron-right' : 'chevron-down'} size="xs" />
        <span className={`section-title ${titleClassName}`.trim()}>{label}</span>
        <span className="agenda-done-count">{tasks.length}</span>
      </button>
      {!collapsed && (
        <TaskList
          tasks={tasks}
          showDeadline={showDeadline}
          overdue={overdue}
          subdued={!overdue}
        />
      )}
    </div>
  )
}
