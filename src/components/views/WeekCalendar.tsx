import { useState, type DragEvent } from 'react'
import { addWeeks, subWeeks } from 'date-fns'
import { usePlanStore } from '../../store/planStore'
import {
  getInboxTasks,
  getProjectById,
  getTasksForDay,
  getDoneTasksForDay,
  isCompletedLate,
} from '../../lib/selectors'
import {
  formatDate,
  formatWeekdayShort,
  getWeekDays,
  parseDate,
  formatWeekRange,
  today,
} from '../../lib/dates'
import { formatHolidayShort, getHolidayForDate, isNonWorkingDay } from '../../lib/holidays'
import { isDailyMeetingDay } from '../../lib/dailyMeetings'
import { PeriodNav } from '../ui/PeriodNav'

export function WeekCalendar() {
  const tasks = usePlanStore((s) => s.data.tasks)
  const projects = usePlanStore((s) => s.data.projects)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const setWeekAnchor = usePlanStore((s) => s.setWeekAnchor)
  const moveTaskDeadline = usePlanStore((s) => s.moveTaskDeadline)
  const openEditTask = usePlanStore((s) => s.openEditTask)
  const calendar = usePlanStore((s) => s.data.settings.calendar)
  const daily = usePlanStore((s) => s.data.settings.daily)

  const [dragOverDay, setDragOverDay] = useState<string | null>(null)
  const [dragOverInbox, setDragOverInbox] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const anchor = parseDate(weekAnchor)
  const weekDays = getWeekDays(anchor)
  const now = today()
  const inboxTasks = getInboxTasks(tasks)

  const resolveDragId = (e: DragEvent) => {
    return e.dataTransfer.getData('text/task-id') || draggingId
  }

  const handleDropOnDay = (dateStr: string, e: DragEvent) => {
    e.preventDefault()
    const id = resolveDragId(e)
    if (id) moveTaskDeadline(id, dateStr)
    setDraggingId(null)
    setDragOverDay(null)
  }

  const handleDropOnInbox = (e: DragEvent) => {
    e.preventDefault()
    const id = resolveDragId(e)
    if (id) moveTaskDeadline(id, null)
    setDraggingId(null)
    setDragOverInbox(false)
  }

  return (
    <div className="week-layout calendar-panel-fill">
      <div className="week-main">
        <PeriodNav
          label={formatWeekRange(anchor)}
          onPrevious={() => setWeekAnchor(formatDate(subWeeks(anchor, 1)))}
          onNext={() => setWeekAnchor(formatDate(addWeeks(anchor, 1)))}
          onToday={() => setWeekAnchor(formatDate(new Date()))}
          previousLabel="Предыдущая неделя"
          nextLabel="Следующая неделя"
        />

        <div className="week-grid">
          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            const dayTasks = getTasksForDay(tasks, day)
            const dayDoneTasks = getDoneTasksForDay(tasks, day)
            const isToday =
              day.getFullYear() === now.getFullYear() &&
              day.getMonth() === now.getMonth() &&
              day.getDate() === now.getDate()
            const holiday = calendar.showHolidays ? getHolidayForDate(day) : null
            const isDaily =
              daily.enabled && isDailyMeetingDay(day, daily.days)

            const isOff = isNonWorkingDay(day)

            return (
              <div
                key={dateStr}
                className={`week-day ${isToday ? 'today' : ''} ${dragOverDay === dateStr ? 'drag-over' : ''} ${holiday ? 'holiday' : ''} ${isOff ? 'non-working' : ''} ${isDaily ? 'daily-meeting' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverDay(dateStr)
                }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={(e) => handleDropOnDay(dateStr, e)}
              >
                <div className="week-day-header">
                  <p className="week-day-name">{formatWeekdayShort(day)}</p>
                  <p className="week-day-num">{day.getDate()}</p>
                  {holiday && (
                    <span className="week-holiday-label" title={holiday.name}>
                      {formatHolidayShort(day, holiday)}
                    </span>
                  )}
                  {isDaily && (
                    <span className="calendar-event calendar-event-daily week-daily-badge">
                      ◆ дейлик
                    </span>
                  )}
                </div>
                <div className="week-day-tasks">
                  {dayTasks.map((task) => {
                    const project = getProjectById(projects, task.projectId)
                    return (
                      <div
                        key={task.id}
                        className={`week-task priority-${task.priority}`}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(task.id)
                          e.dataTransfer.setData('text/task-id', task.id)
                        }}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setDragOverDay(null)
                        }}
                        onClick={() => openEditTask(task.id)}
                        style={
                          project ? { borderLeftColor: project.color } : undefined
                        }
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                  {dayDoneTasks.map((task) => {
                    const project = getProjectById(projects, task.projectId)
                    return (
                      <div
                        key={task.id}
                        className={`week-task week-task-done priority-${task.priority}`}
                        onClick={() => openEditTask(task.id)}
                        style={
                          project ? { borderLeftColor: project.color } : undefined
                        }
                        title={`${task.title} (выполнено${isCompletedLate(task) ? ', не в срок' : ''})`}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <aside
        className={`week-inbox-panel ${dragOverInbox ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverInbox(true)
        }}
        onDragLeave={() => setDragOverInbox(false)}
        onDrop={handleDropOnInbox}
      >
        <h3 className="week-inbox-title">Без даты ({inboxTasks.length})</h3>
        <p className="settings-hint">Перетащите сюда, чтобы снять дедлайн</p>
        <div className="week-inbox-list">
          {inboxTasks.map((task) => (
            <div
              key={task.id}
              className="week-task week-inbox-task"
              draggable
              onDragStart={(e) => {
                setDraggingId(task.id)
                e.dataTransfer.setData('text/task-id', task.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragEnd={() => setDraggingId(null)}
              onClick={() => openEditTask(task.id)}
            >
              {task.title}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
