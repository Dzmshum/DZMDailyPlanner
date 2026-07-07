import {
  WEEKDAY_CHIP_ORDER,
  WEEKDAY_SHORT,
  dailyDaysEqual,
  normalizeDailyDays,
} from '../../lib/dailyLabels'

const PRESETS: { id: string; label: string; days: number[] }[] = [
  { id: 'mon-thu', label: 'Пн+Чт', days: [1, 4] },
  { id: 'weekdays', label: 'Каждый будний', days: [1, 2, 3, 4, 5] },
]

interface DailyDaysPickerProps {
  days: number[]
  onChange: (days: number[]) => void
}

export function DailyDaysPicker({ days, onChange }: DailyDaysPickerProps) {
  const selected = normalizeDailyDays(days)

  const toggleDay = (day: number) => {
    const has = selected.includes(day)
    if (has && selected.length <= 1) return
    const next = has ? selected.filter((d) => d !== day) : [...selected, day].sort((a, b) => a - b)
    onChange(next)
  }

  return (
    <div className="daily-days-picker">
      <div className="daily-days-chips" role="group" aria-label="Дни созвонов">
        {WEEKDAY_CHIP_ORDER.map((day) => {
          const active = selected.includes(day)
          return (
            <button
              key={day}
              type="button"
              className={`daily-day-chip${active ? ' active' : ''}`}
              aria-pressed={active}
              onClick={() => toggleDay(day)}
            >
              {WEEKDAY_SHORT[day]}
            </button>
          )
        })}
      </div>

      <div className="daily-days-presets">
        <span className="daily-days-presets-label">Быстрые пресеты:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`btn btn-sm${dailyDaysEqual(selected, preset.days) ? ' btn-primary' : ''}`}
            onClick={() => onChange(preset.days)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
