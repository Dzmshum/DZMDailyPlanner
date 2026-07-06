import { addYears, eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns'
import { ru } from 'date-fns/locale'
import { usePlanStore } from '../../store/planStore'
import { getTasksWithDeadlineInRange } from '../../lib/selectors'
import { formatDate, parseDate } from '../../lib/dates'
import { PeriodNav } from '../ui/PeriodNav'

export function YearCalendar() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const setWeekAnchor = usePlanStore((s) => s.setWeekAnchor)

  const anchor = parseDate(weekAnchor)
  const yearStart = startOfYear(anchor)
  const yearEnd = endOfYear(anchor)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  const maxCount = Math.max(
    1,
    ...months.map((m) => {
      const ms = new Date(m.getFullYear(), m.getMonth(), 1)
      const me = new Date(m.getFullYear(), m.getMonth() + 1, 0)
      return getTasksWithDeadlineInRange(tasks, ms, me).length
    }),
  )

  return (
    <div className="calendar-panel-fill">
      <PeriodNav
        label={format(anchor, 'yyyy')}
        onPrevious={() => setWeekAnchor(formatDate(addYears(anchor, -1)))}
        onNext={() => setWeekAnchor(formatDate(addYears(anchor, 1)))}
        onToday={() => setWeekAnchor(formatDate(new Date()))}
        previousLabel="Предыдущий год"
        nextLabel="Следующий год"
      />

      <div className="year-heatmap">
        {months.map((month) => {
          const ms = new Date(month.getFullYear(), month.getMonth(), 1)
          const me = new Date(month.getFullYear(), month.getMonth() + 1, 0)
          const count = getTasksWithDeadlineInRange(tasks, ms, me).length
          const intensity = count / maxCount

          return (
            <div
              key={month.toISOString()}
              className="year-month-cell"
              style={{ opacity: 0.35 + intensity * 0.65 }}
              title={`${format(month, 'LLLL', { locale: ru })}: ${count}`}
            >
              <span>{format(month, 'LLL', { locale: ru })}</span>
              <strong>{count}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
