import { isSameDay } from 'date-fns'
import type { Task } from '../../types'
import { formatDisplayDate, today } from '../../lib/dates'
import { getDayProgress } from '../../lib/selectors'
import { usePlanStore } from '../../store/planStore'

interface DayProgressBarProps {
  tasks: Task[]
  date: Date
  compact?: boolean
  showLabel?: boolean
  showPercent?: boolean
  showFraction?: boolean
  className?: string
}

export function DayProgressBar({
  tasks,
  date,
  compact = false,
  showLabel = false,
  showPercent = true,
  showFraction = true,
  className,
}: DayProgressBarProps) {
  const prefs = usePlanStore((s) => s.data.settings.dayProgress)
  const percentOn = showPercent && prefs.showPercent !== false
  const fractionOn = showFraction && prefs.showFraction !== false
  const { done, total, ratio } = getDayProgress(tasks, date)
  const empty = total === 0
  const percent = Math.round(ratio * 100)

  if (compact && empty) return null

  const label = isSameDay(date, today()) ? 'Сегодня' : formatDisplayDate(date)
  const ariaLabel = empty
    ? 'Нет задач на день'
    : `${percent} процентов, ${done} из ${total} задач`
  const fractionText = compact ? `${done}/${total}` : `${done} из ${total}`

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
        aria-valuenow={empty ? 0 : percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={ariaLabel}
        aria-label={ariaLabel}
      >
        <div
          className="day-progress-fill"
          style={{ width: empty ? '0%' : `${percent}%` }}
        />
      </div>
      {percentOn && (
        <span className="day-progress-percent">{empty ? '—' : `${percent}%`}</span>
      )}
      {fractionOn && (
        <span className="day-progress-fraction">
          {empty ? (compact ? '—' : 'Нет задач на день') : fractionText}
        </span>
      )}
    </div>
  )
}
