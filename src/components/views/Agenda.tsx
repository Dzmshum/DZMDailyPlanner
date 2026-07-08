import { useState } from 'react'
import { addDays, subDays } from 'date-fns'
import { usePlanStore } from '../../store/planStore'
import {
  getDoneTasksForDay,
  getOverdueTasksForAgenda,
  getTasksForDay,
  groupTasksByProject,
} from '../../lib/selectors'
import { formatDisplayDate, formatDate, parseDate } from '../../lib/dates'
import { TaskList } from '../tasks/TaskList'
import { DoneTasksCollapsible } from '../tasks/DoneTasksCollapsible'
import { EmptyState } from '../ui/EmptyState'
import { UiIcon } from '../ui/UiIcon'
import { PeriodNav } from '../ui/PeriodNav'
import { DayProgressBar } from '../ui/DayProgressBar'

export function Agenda() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const agendaDate = usePlanStore((s) => s.agendaDate)
  const setAgendaDate = usePlanStore((s) => s.setAgendaDate)
  const showDayProgress = usePlanStore((s) => s.data.settings.dayProgress.showOnAgenda)

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const date = parseDate(agendaDate)
  const overdueTasks = getOverdueTasksForAgenda(tasks, date)
  const activeTasks = getTasksForDay(tasks, date)
  const doneTasks = getDoneTasksForDay(tasks, date)
  const activeGroups = groupTasksByProject(activeTasks, projects)
  const doneGroups = groupTasksByProject(doneTasks, projects)

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasAny = activeTasks.length > 0 || doneTasks.length > 0 || overdueTasks.length > 0
  const twoColumns = doneTasks.length > 0

  return (
    <div className="agenda-view">
      <PeriodNav
        label={formatDisplayDate(date)}
        onPrevious={() => setAgendaDate(formatDate(subDays(date, 1)))}
        onNext={() => setAgendaDate(formatDate(addDays(date, 1)))}
        onToday={() => setAgendaDate(formatDate(new Date()))}
        previousLabel="Предыдущий день"
        nextLabel="Следующий день"
      />

      {showDayProgress && (
        <DayProgressBar tasks={tasks} date={date} className="day-progress--agenda" />
      )}

      {!hasAny ? (
        <EmptyState
          title="Нет задач на этот день"
          text="Добавьте задачу с дедлайном на выбранную дату"
        />
      ) : (
        <div className={`agenda-layout ${twoColumns ? '' : 'agenda-layout-single'}`}>
          <section className="agenda-main">
            <DoneTasksCollapsible
              tasks={overdueTasks}
              label="Просрочено"
              showDeadline
              overdue
              defaultCollapsed
              titleClassName="danger"
              className="agenda-overdue-section done-tasks-collapsible--top"
            />

            {activeTasks.length > 0 ? (
              <>
                <h2 className="section-title accent">К выполнению</h2>
                {activeGroups.map((group) => {
                  const key = group.project?.id ?? 'none'
                  const isCollapsed = collapsed.has(key)
                  return (
                    <div key={key} className="project-group">
                      <div
                        className="project-group-header"
                        onClick={() => toggleGroup(key)}
                      >
                        <UiIcon
                          icon={isCollapsed ? 'chevron-right' : 'chevron-down'}
                          size="xs"
                        />
                        <h3 className="project-group-title">
                          {group.project?.name ?? 'Без проекта'} ({group.tasks.length})
                        </h3>
                      </div>
                      {!isCollapsed && (
                        <TaskList tasks={group.tasks} showDeadline={false} />
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <div className="agenda-main-empty">
                <h2 className="section-title accent">К выполнению</h2>
                <p className="agenda-all-done-hint">
                  На этот день все запланированные задачи выполнены.
                </p>
              </div>
            )}
          </section>

          {doneTasks.length > 0 && (
            <aside className="agenda-sidebar">
              <div className="agenda-sidebar-header">
                <h2 className="section-title">Выполнено</h2>
                <span className="agenda-done-count">{doneTasks.length}</span>
              </div>
              {doneGroups.map((group) => {
                const key = `done-${group.project?.id ?? 'none'}`
                return (
                  <div key={key} className="project-group project-group-done">
                    <h3 className="project-group-title project-group-title-muted">
                      {group.project?.name ?? 'Без проекта'} ({group.tasks.length})
                    </h3>
                    <TaskList tasks={group.tasks} showDeadline={false} subdued />
                  </div>
                )
              })}
            </aside>
          )}
        </div>
      )}
    </div>
  )
}
