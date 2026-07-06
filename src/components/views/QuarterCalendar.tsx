import { addMonths, startOfQuarter, endOfQuarter, eachMonthOfInterval } from 'date-fns'
import { usePlanStore } from '../../store/planStore'
import { getTasksWithDeadlineInRange } from '../../lib/selectors'
import { formatDate, formatMonthYear, formatQuarterYear, parseDate } from '../../lib/dates'
import { PeriodNav } from '../ui/PeriodNav'

export function QuarterCalendar() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const setWeekAnchor = usePlanStore((s) => s.setWeekAnchor)

  const anchor = parseDate(weekAnchor)
  const qStart = startOfQuarter(anchor)
  const qEnd = endOfQuarter(anchor)
  const months = eachMonthOfInterval({ start: qStart, end: qEnd })

  return (
    <div className="calendar-panel-fill">
      <PeriodNav
        label={formatQuarterYear(anchor)}
        onPrevious={() => setWeekAnchor(formatDate(addMonths(anchor, -3)))}
        onNext={() => setWeekAnchor(formatDate(addMonths(anchor, 3)))}
        onToday={() => setWeekAnchor(formatDate(new Date()))}
        previousLabel="Предыдущий квартал"
        nextLabel="Следующий квартал"
      />

      <div className="quarter-grid">
        {months.map((month) => {
          const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
          const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
          const monthTasks = getTasksWithDeadlineInRange(tasks, monthStart, monthEnd)

          return (
            <div key={month.toISOString()} className="quarter-month-card">
              <h3 className="quarter-month-title">{formatMonthYear(month)}</h3>
              <p className="quarter-month-stat">
                {monthTasks.length} активных задач
              </p>
              <ul className="quarter-month-list">
                {monthTasks.slice(0, 8).map((t) => (
                  <li key={t.id}>{t.title}</li>
                ))}
                {monthTasks.length > 8 && (
                  <li>…ещё {monthTasks.length - 8}</li>
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
