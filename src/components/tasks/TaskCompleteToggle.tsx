import type { TaskStatus } from '../../types'

interface TaskCompleteToggleProps {
  checked: boolean
  onToggle: () => void
  taskTitle: string
  status?: TaskStatus
}

export function TaskCompleteToggle({
  checked,
  onToggle,
  taskTitle,
  status = 'todo',
}: TaskCompleteToggleProps) {
  const label = checked ? 'Вернуть' : 'Готово'

  return (
    <div
      className={`task-complete-wrap ${checked ? 'is-done' : ''} status-${status}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={
          checked
            ? `Снять отметку «${taskTitle}»`
            : `Отметить выполненной «${taskTitle}»`
        }
        className={`task-complete-toggle ${checked ? 'is-done' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        <span className="task-complete-aura" aria-hidden />
        <span className="task-complete-plate" aria-hidden />
        <svg className="task-complete-rune" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            className="task-complete-rune-mark"
            d="M7 12.5 10.5 16 17 8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            className="task-complete-rune-spark"
            d="M12 4v3M12 17v3M4 12h3M17 12h3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="square"
            opacity="0.5"
          />
        </svg>
      </button>
      <span className="task-complete-slide" aria-hidden>
        {label}
      </span>
    </div>
  )
}
