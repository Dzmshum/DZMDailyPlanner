import type { Task } from '../../types'

interface DailyReportTaskListProps {
  tasks: Task[]
  subdued?: boolean
}

export function DailyReportTaskList({ tasks, subdued = false }: DailyReportTaskListProps) {
  return (
    <ul className={`daily-report-list${subdued ? ' daily-report-list-subdued' : ''}`}>
      {tasks.map((task) => (
        <li key={task.id} className="daily-report-item">
          <div className="daily-report-item-title">{task.title}</div>
          {task.notes.trim() ? (
            <div className="daily-report-item-notes">{task.notes.trim()}</div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
