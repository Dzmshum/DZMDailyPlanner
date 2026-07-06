import { useMemo, useState } from 'react'
import type { Priority, TaskStatus } from '../../types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { getActiveTasks } from '../../lib/selectors'
import { TaskList } from '../tasks/TaskList'

export function TasksView() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const searchQuery = usePlanStore((s) => s.searchQuery)
  const setSearchQuery = usePlanStore((s) => s.setSearchQuery)

  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('')
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('')

  const filtered = useMemo(() => {
    let result = getActiveTasks(tasks)

    if (filterProject) {
      result = result.filter((t) =>
        filterProject === 'none' ? !t.projectId : t.projectId === filterProject,
      )
    }
    if (filterStatus) {
      result = result.filter((t) => t.status === filterStatus)
    }
    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q),
      )
    }

    const noDate = result.filter((t) => !t.deadline)
    const withDate = result
      .filter((t) => t.deadline)
      .sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))

    return { withDate, noDate }
  }, [tasks, filterProject, filterStatus, filterPriority, searchQuery])

  return (
    <div>
      <div className="filters-bar">
        <input
          id="global-search"
          className="form-input"
          placeholder="Поиск задач... (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="form-select"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">Все проекты</option>
          <option value="none">Без проекта</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
        >
          <option value="">Все статусы</option>
          {(Object.keys(STATUS_LABELS) as TaskStatus[])
            .filter((s) => s !== 'done')
            .map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
        </select>
        <select
          className="form-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | '')}
        >
          <option value="">Все приоритеты</option>
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {filtered.withDate.length > 0 && (
        <section className="section">
          <h2 className="section-title">С дедлайном ({filtered.withDate.length})</h2>
          <TaskList tasks={filtered.withDate} />
        </section>
      )}

      {filtered.noDate.length > 0 && (
        <section className="section">
          <h2 className="section-title">Без даты ({filtered.noDate.length})</h2>
          <TaskList tasks={filtered.noDate} showDeadline={false} />
        </section>
      )}

      {filtered.withDate.length === 0 && filtered.noDate.length === 0 && (
        <TaskList tasks={[]} emptyTitle="Задачи не найдены" />
      )}
    </div>
  )
}
