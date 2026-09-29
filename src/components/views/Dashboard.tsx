import type { ReactNode } from 'react'
import { usePlanStore } from '../../store/planStore'
import {
  getDoneTodayTasks,
  getDoneUpcomingTasks,
  getOverdueTasks,
  getTodayTasks,
  getUpcomingTasks,
} from '../../lib/selectors'
import { TaskList } from '../tasks/TaskList'
import { DoneTasksCollapsible } from '../tasks/DoneTasksCollapsible'
import { DayProgressBar } from '../ui/DayProgressBar'

function DashboardCard({
  title,
  count,
  tone,
  meta,
  children,
}: {
  title: string
  count: number
  tone?: 'danger' | 'accent'
  meta?: string
  children: ReactNode
}) {
  return (
    <section
      className={[
        'dashboard-card',
        tone === 'danger' ? 'dashboard-card--danger' : '',
        tone === 'accent' ? 'dashboard-card--accent' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="dashboard-card-head">
        <div className="dashboard-card-heading">
          <h2 className="dashboard-card-title">{title}</h2>
          {meta ? <p className="dashboard-card-meta">{meta}</p> : null}
        </div>
        <span className="dashboard-card-count">{count}</span>
      </header>
      {children}
    </section>
  )
}

export function Dashboard() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const showDayProgress = usePlanStore((s) => s.data.settings.dayProgress.showOnDashboard)
  const overdue = getOverdueTasks(tasks)
  const today = getTodayTasks(tasks)
  const todayDone = getDoneTodayTasks(tasks)
  const upcoming = getUpcomingTasks(tasks)
  const upcomingDone = getDoneUpcomingTasks(tasks)
  const calm = overdue.length === 0

  return (
    <div className="dashboard">
      {calm ? <p className="dashboard-calm">Просроченных нет</p> : null}
      <div className={`dashboard-board${calm ? ' dashboard-board--calm' : ''}`}>
        {!calm && (
          <DashboardCard title="Горит" count={overdue.length} tone="danger">
            <TaskList tasks={overdue} overdue />
          </DashboardCard>
        )}

        <DashboardCard
          title="Сегодня"
          count={today.length}
          tone="accent"
          meta={todayDone.length > 0 ? `${todayDone.length} выполнено` : undefined}
        >
          {showDayProgress && today.length + todayDone.length > 0 && (
            <DayProgressBar tasks={tasks} date={new Date()} className="day-progress--dashboard" />
          )}
          <TaskList
            tasks={today}
            emptyTitle={
              todayDone.length > 0 ? 'Активных задач нет' : 'На сегодня задач нет'
            }
            emptyText={
              todayDone.length > 0
                ? 'Всё запланированное на сегодня закрыто'
                : 'Добавьте задачу с дедлайном на сегодня'
            }
            showDeadline={false}
          />
          <DoneTasksCollapsible tasks={todayDone} label="Выполнено сегодня" />
        </DashboardCard>

        <DashboardCard
          title="7 дней"
          count={upcoming.length}
          meta={upcomingDone.length > 0 ? `${upcomingDone.length} выполнено` : undefined}
        >
          <TaskList
            tasks={upcoming}
            emptyTitle={
              upcomingDone.length > 0 ? 'Активных задач нет' : 'Нет предстоящих задач'
            }
            emptyText={
              upcomingDone.length > 0
                ? 'Задачи на эти даты уже закрыты'
                : 'Сюда попадут дедлайны ближайшей недели'
            }
          />
          <DoneTasksCollapsible
            tasks={upcomingDone}
            label="Выполнено на ближайшие дни"
            showDeadline
          />
        </DashboardCard>
      </div>
    </div>
  )
}
