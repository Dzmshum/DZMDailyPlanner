import type { CalendarView as CalendarViewId } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { WeekCalendar } from './WeekCalendar'
import { MonthCalendar } from './MonthCalendar'
import { QuarterCalendar } from './QuarterCalendar'
import { YearCalendar } from './YearCalendar'
import { SegmentedControl, SegmentedControlItem } from '../ui/SegmentedControl'

const VIEWS: { id: CalendarViewId; label: string }[] = [
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'year', label: 'Год' },
]

export function CalendarView() {
  const calendarView = usePlanStore((s) => s.data.settings.calendar.calendarView)
  const setCalendarSettings = usePlanStore((s) => s.setCalendarSettings)

  return (
    <div className="calendar-view-fill">
      <SegmentedControl className="calendar-view-tabs" aria-label="Разрез календаря">
        {VIEWS.map((v) => (
          <SegmentedControlItem
            key={v.id}
            active={calendarView === v.id}
            onClick={() => setCalendarSettings({ calendarView: v.id })}
          >
            {v.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <div className="calendar-view-body">
        {calendarView === 'week' && <WeekCalendar />}
        {calendarView === 'month' && <MonthCalendar />}
        {calendarView === 'quarter' && <QuarterCalendar />}
        {calendarView === 'year' && <YearCalendar />}
      </div>
    </div>
  )
}
