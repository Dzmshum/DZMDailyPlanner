import { UiIcon } from './UiIcon'

interface NavArrowButtonProps {
  direction: 'previous' | 'next'
  onClick: () => void
  label: string
}

export function NavArrowButton({ direction, onClick, label }: NavArrowButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-nav-icon"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <UiIcon
        icon="chevron-right"
        size="xs"
        className={direction === 'previous' ? 'ui-icon-mirror' : undefined}
      />
    </button>
  )
}

interface PeriodNavProps {
  label: string
  onPrevious: () => void
  onNext: () => void
  onToday?: () => void
  previousLabel?: string
  nextLabel?: string
  todayLabel?: string
}

export function PeriodNav({
  label,
  onPrevious,
  onNext,
  onToday,
  previousLabel = 'Назад',
  nextLabel = 'Вперёд',
  todayLabel = 'Сегодня',
}: PeriodNavProps) {
  return (
    <div className="period-nav">
      <div className="period-nav-controls">
        <NavArrowButton direction="previous" onClick={onPrevious} label={previousLabel} />
        <span className="period-nav-label">{label}</span>
        <NavArrowButton direction="next" onClick={onNext} label={nextLabel} />
      </div>
      {onToday && (
        <button type="button" className="btn btn-nav-today" onClick={onToday}>
          {todayLabel}
        </button>
      )}
    </div>
  )
}
