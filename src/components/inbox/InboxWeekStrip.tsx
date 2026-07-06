import { useState, type DragEvent } from 'react'
import { usePlanStore } from '../../store/planStore'
import { getWeekDays, formatDate, formatWeekdayShort, parseDate } from '../../lib/dates'
import { getHolidayForDate, isNonWorkingDay } from '../../lib/holidays'
import { isDailyMeetingDay } from '../../lib/dailyMeetings'

export function InboxWeekStrip() {
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const moveTaskDeadline = usePlanStore((s) => s.moveTaskDeadline)
  const calendar = usePlanStore((s) => s.data.settings.calendar)
  const daily = usePlanStore((s) => s.data.settings.daily)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)

  const weekDays = getWeekDays(parseDate(weekAnchor))

  const handleDrop = (dateStr: string, e: DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/task-id')
    if (id) moveTaskDeadline(id, dateStr)
    setDragOverDay(null)
  }

  return (
    <div className="inbox-week-strip">
      <p className="inbox-week-strip-label">Перетащите на день недели:</p>
      <div className="inbox-week-strip-days">
        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          const holiday = calendar.showHolidays ? getHolidayForDate(day) : null
          const isDaily =
            daily.enabled && isDailyMeetingDay(day, daily.days)

          return (
            <div
              key={dateStr}
              className={`inbox-week-drop ${dragOverDay === dateStr ? 'drag-over' : ''} ${holiday ? 'holiday' : ''} ${isNonWorkingDay(day) ? 'non-working' : ''} ${isDaily ? 'daily-meeting' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverDay(dateStr)
              }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => handleDrop(dateStr, e)}
              title={holiday?.name}
            >
              <span className="inbox-week-drop-name">{formatWeekdayShort(day)}</span>
              <span className="inbox-week-drop-num">{day.getDate()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
