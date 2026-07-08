import { useMemo } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getDoneTasksGroupedByDate } from '../../lib/selectors'
import { TaskCardHistory } from '../tasks/TaskCard'
import { EmptyState } from '../ui/EmptyState'

export function History() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const searchQuery = usePlanStore((s) => s.searchQuery)
  const setSearchQuery = usePlanStore((s) => s.setSearchQuery)

  const groups = useMemo(() => {
    let result = getDoneTasksGroupedByDate(tasks)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result
        .map((g) => ({
          ...g,
          tasks: g.tasks.filter((t) => t.title.toLowerCase().includes(q)),
        }))
        .filter((g) => g.tasks.length > 0)
    }
    return result
  }, [tasks, searchQuery])

  const totalDone = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="history-view">
      <div className="filters-bar">
        <input
          id="global-search"
          className="form-input"
          placeholder="Поиск в истории... (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {totalDone === 0 ? (
        <EmptyState
          title="История пуста"
          text="Выполненные задачи появятся здесь"
        />
      ) : groups.length === 0 ? (
        <EmptyState title="Ничего не найдено" text="Попробуйте другой запрос" />
      ) : (
        <div className="history-groups">
          {groups.map((group) => (
            <section key={group.date} className="history-day-group">
              <h2 className="history-day-title">{group.label}</h2>
              <div className="task-list">
                {group.tasks.map((task) => (
                  <TaskCardHistory key={task.id} task={task} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
