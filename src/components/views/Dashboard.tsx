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

export function Dashboard() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const showDayProgress = usePlanStore((s) => s.data.settings.dayProgress.showOnDashboard)
  const overdue = getOverdueTasks(tasks)
  const today = getTodayTasks(tasks)
  const todayDone = getDoneTodayTasks(tasks)
  const upcoming = getUpcomingTasks(tasks)
  const upcomingDone = getDoneUpcomingTasks(tasks)

  return (
    <div className="dashboard-grid">
      <section className="section">
        <h2 className="section-title danger">Горит — просрочено ({overdue.length})</h2>
        <TaskList
          tasks={overdue}
          emptyTitle="Нет просроченных задач"
          emptyText="Отличная работа!"
          overdue
        />
      </section>

      <section className="section">
        <h2 className="section-title accent">
          Сегодня ({today.length}
          {todayDone.length > 0 ? ` + ${todayDone.length} ✓` : ''})
        </h2>
        {showDayProgress && (
          <DayProgressBar tasks={tasks} date={new Date()} showLabel className="day-progress--dashboard" />
        )}
        <TaskList
          tasks={today}
          emptyTitle={
            todayDone.length > 0
              ? 'На сегодня активных задач нет'
              : 'На сегодня задач нет'
          }
          emptyText={
            todayDone.length > 0
              ? 'Все запланированные на сегодня задачи выполнены'
              : 'Добавьте задачу с дедлайном на сегодня'
          }
          showDeadline={false}
        />
        <DoneTasksCollapsible tasks={todayDone} label="Выполнено сегодня" />
      </section>

      <section className="section">
        <h2 className="section-title">
          Ближайшие 7 дней ({upcoming.length}
          {upcomingDone.length > 0 ? ` + ${upcomingDone.length} ✓` : ''})
        </h2>
        <TaskList
          tasks={upcoming}
          emptyTitle={
            upcomingDone.length > 0
              ? 'Нет активных задач на ближайшую неделю'
              : 'Нет предстоящих задач'
          }
          emptyText={
            upcomingDone.length > 0
              ? 'Все задачи на эти даты уже выполнены'
              : 'Задачи с дедлайном в ближайшую неделю появятся здесь'
          }
        />
        <DoneTasksCollapsible
          tasks={upcomingDone}
          label="Выполнено на ближайшие дни"
          showDeadline
        />
      </section>
    </div>
  )
}
