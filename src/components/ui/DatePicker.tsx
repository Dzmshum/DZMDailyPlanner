import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatDate, parseDate, today } from '../../lib/dates'
import { NavArrowButton } from './PeriodNav'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
}

const POPUP_WIDTH = 280
const POPUP_HEIGHT = 340

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({})
  const selected = value ? parseDate(value) : today()
  const [viewMonth, setViewMonth] = useState(startOfMonth(selected))

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [viewMonth])

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom - 8
      const spaceAbove = rect.top - 8
      const openAbove = spaceBelow < POPUP_HEIGHT && spaceAbove > spaceBelow

      let top = openAbove ? rect.top - POPUP_HEIGHT - 6 : rect.bottom + 6
      let left = rect.left

      top = Math.max(8, Math.min(top, window.innerHeight - POPUP_HEIGHT - 8))
      left = Math.max(8, Math.min(left, window.innerWidth - POPUP_WIDTH - 8))

      setPopupStyle({ top, left, width: POPUP_WIDTH })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, viewMonth])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      const root = anchorRef.current
      if (!root) return
      if (!root.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const pick = (date: Date) => {
    onChange(formatDate(date))
    setOpen(false)
  }

  return (
    <div className="date-picker" ref={anchorRef}>
      <div className="date-picker-input-row">
        <input
          type="date"
          className="form-input date-picker-native"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-nav-icon date-picker-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Открыть календарь"
          title="Календарь"
        >
          📅
        </button>
      </div>

      {open && (
        <div className="date-picker-popup date-picker-popup-fixed" style={popupStyle}>
          <div className="date-picker-header">
            <NavArrowButton
              direction="previous"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              label="Предыдущий месяц"
            />
            <span className="date-picker-month">
              {format(viewMonth, 'LLLL yyyy', { locale: ru })}
            </span>
            <NavArrowButton
              direction="next"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              label="Следующий месяц"
            />
          </div>

          <div className="date-picker-weekdays">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {days.map((day) => {
              const dateStr = formatDate(day)
              const isSelected = value && isSameDay(day, parseDate(value))
              const isToday = isSameDay(day, today())
              return (
                <button
                  key={dateStr}
                  type="button"
                  className={[
                    'date-picker-day',
                    !isSameMonth(day, viewMonth) ? 'muted' : '',
                    isSelected ? 'selected' : '',
                    isToday ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pick(day)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <div className="date-picker-footer">
            <button type="button" className="btn btn-sm" onClick={() => pick(today())}>
              Сегодня
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Очистить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
