import { useRef } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { usePlanStore } from '../../store/planStore'
import { useMonthCellPreviewLimit } from '../../hooks/useMonthCellPreviewLimit'
import { resolveMonthCellTaskPreview } from '../../lib/monthCalendarLayout'
import { getProjectById } from '../../lib/selectors'
import {
  formatDate,
  formatDisplayDate,
  formatMonthYear,
  parseDate,
  today,
} from '../../lib/dates'
import { formatHolidayShort, getHolidayForDate, isCommemorativeHoliday, isNonWorkingDay } from '../../lib/holidays'
import { isDailyMeetingDay } from '../../lib/dailyMeetings'
import { PeriodNav } from '../ui/PeriodNav'

export function MonthCalendar() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const setWeekAnchor = usePlanStore((s) => s.setWeekAnchor)
  const setView = usePlanStore((s) => s.setView)
  const setAgendaDate = usePlanStore((s) => s.setAgendaDate)
  const openEditTask = usePlanStore((s) => s.openEditTask)
  const calendar = usePlanStore((s) => s.data.settings.calendar)
  const daily = usePlanStore((s) => s.data.settings.daily)

  const gridRef = useRef<HTMLDivElement>(null)

  const anchor = parseDate(weekAnchor)
  const monthStart = startOfMonth(anchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekRowCount = days.length / 7
  const previewLimit = useMonthCellPreviewLimit(gridRef, weekRowCount)
  const now = today()

  return (
    <div className="calendar-panel-fill">
      <PeriodNav
        label={formatMonthYear(anchor)}
        onPrevious={() => setWeekAnchor(formatDate(subMonths(anchor, 1)))}
        onNext={() => setWeekAnchor(formatDate(addMonths(anchor, 1)))}
        onToday={() => setWeekAnchor(formatDate(new Date()))}
        previousLabel="Предыдущий месяц"
        nextLabel="Следующий месяц"
      />

      <div className="month-weekdays">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="month-grid" ref={gridRef}>
        {days.map((day) => {
          const dateStr = formatDate(day)
          const inMonth = isSameMonth(day, anchor)
          const preview = resolveMonthCellTaskPreview(tasks, day, previewLimit)
          const holiday = calendar.showHolidays ? getHolidayForDate(day) : null
          const isDaily =
            daily.enabled && isDailyMeetingDay(day, daily.days)
          const isTodayCell = isSameDay(day, now)
          const isOff = isNonWorkingDay(day)
          const isCommemorative =
            holiday !== null && isCommemorativeHoliday(day, holiday)

          const cellTitle = [
            formatDisplayDate(day),
            holiday?.name,
            preview.total > 0 ? `${preview.total} задач` : null,
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <button
              key={dateStr}
              type="button"
              className={`month-cell ${inMonth ? '' : 'muted'} ${isTodayCell ? 'today' : ''} ${holiday && isOff ? 'holiday' : ''} ${isCommemorative ? 'commemorative-day' : ''} ${isOff ? 'non-working' : ''} ${isDaily ? 'daily-meeting' : ''}`}
              onClick={() => {
                setAgendaDate(dateStr)
                setView('agenda')
              }}
              title={cellTitle}
            >
              <div className="month-cell-top">
                <span
                  className={`month-cell-num${isTodayCell ? ' month-cell-num-today' : ''}`}
                >
                  {format(day, 'd')}
                </span>
                <div className="month-cell-badges">
                  {holiday ? (
                    <span
                      className={`month-cell-holiday${isCommemorative ? ' month-cell-holiday-commemorative' : ''}`}
                      title={holiday.name}
                    >
                      {formatHolidayShort(day, holiday)}
                    </span>
                  ) : null}
                  {isDaily ? (
                    <span className="calendar-event calendar-event-daily month-daily-badge" title="Дейлик">
                      ◆
                    </span>
                  ) : null}
                </div>
              </div>

              {preview.total > 0 ? (
                <div className="month-cell-tasks">
                  {preview.items.map(({ task, done }) => {
                    const project = getProjectById(projects, task.projectId)
                    return (
                      <div
                        key={task.id}
                        className={`month-task priority-${task.priority}${done ? ' month-task-done' : ''}${project?.completed ? ' month-task-project-completed' : ''}`}
                        style={
                          project ? { borderLeftColor: project.color } : undefined
                        }
                        title={task.title}
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditTask(task.id)
                        }}
                      >
                        <span className="month-task-title">{task.title}</span>
                      </div>
                    )
                  })}
                  {preview.overflow > 0 ? (
                    <span className="month-task-more">+{preview.overflow}</span>
                  ) : null}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
