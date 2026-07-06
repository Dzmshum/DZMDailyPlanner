import { useState } from 'react'
import type { Task } from '../../types'
import { TaskList } from './TaskList'
import { UiIcon } from '../ui/UiIcon'

interface DoneTasksCollapsibleProps {
  tasks: Task[]
  label?: string
  showDeadline?: boolean
}

export function DoneTasksCollapsible({
  tasks,
  label = 'Выполнено',
  showDeadline = false,
}: DoneTasksCollapsibleProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (tasks.length === 0) return null

  return (
    <div className="done-tasks-collapsible">
      <button
        type="button"
        className="agenda-done-header"
        onClick={() => setCollapsed((v) => !v)}
      >
        <UiIcon icon={collapsed ? 'chevron-right' : 'chevron-down'} size="xs" />
        <span className="section-title">{label}</span>
        <span className="agenda-done-count">{tasks.length}</span>
      </button>
      {!collapsed && (
        <TaskList tasks={tasks} showDeadline={showDeadline} subdued />
      )}
    </div>
  )
}
