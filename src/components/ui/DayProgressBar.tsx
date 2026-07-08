import { isSameDay } from 'date-fns'
import type { Task } from '../../types'
import { formatDisplayDate, today } from '../../lib/dates'
import { getDayProgress } from '../../lib/selectors'

interface DayProgressBarProps {
  tasks: Task[]
  date: Date
  compact?: boolean
  showLabel?: boolean
  className?: string
}

export function DayProgressBar({
  tasks,
  date,
  compact = false,
  showLabel = false,
  className,
}: DayProgressBarProps) {
  const { done, total, ratio } = getDayProgress(tasks, date)
  const empty = total === 0
  const percent = Math.round(ratio * 100)

  if (compact && empty) return null

  const label = isSameDay(date, today()) ? 'Сегодня' : formatDisplayDate(date)
  const ariaLabel = empty
    ? 'Нет задач на день'
    : `Выполнено ${done} из ${total} задач`

  return (
    <div
      className={[
        'day-progress',
        compact ? 'day-progress--compact' : '',
        empty ? 'day-progress--empty' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showLabel && <span className="day-progress-label">{label}</span>}
      <div
        className="day-progress-track"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, 1)}
        aria-label={ariaLabel}
      >
        <div
          className="day-progress-fill"
          style={{ width: empty ? '0%' : `${percent}%` }}
        />
      </div>
      <span className="day-progress-fraction">
        {empty ? (compact ? '—' : 'Нет задач на день') : `${done}/${total}`}
      </span>
    </div>
  )
}
