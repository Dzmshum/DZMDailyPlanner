import { useMemo, useState } from 'react'
import type { ExportPeriod } from '../../lib/exportPlanText'
import { exportPlanText } from '../../lib/exportPlanText'
import { usePlanStore } from '../../store/planStore'
import { parseDate } from '../../lib/dates'
import { Modal } from './Modal'
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl'
import { ThemedCheckbox } from './ThemedCheckbox'
import { RECENT_DONE_DAY_OPTIONS } from '../../types'

interface ExportTextModalProps {
  open: boolean
  onClose: () => void
}

const PERIODS: { id: ExportPeriod; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'year', label: 'Год' },
]

export function ExportTextModal({ open, onClose }: ExportTextModalProps) {
  const data = usePlanStore((s) => s.data)
  const agendaDate = usePlanStore((s) => s.agendaDate)
  const weekAnchor = usePlanStore((s) => s.weekAnchor)
  const exportSettings = usePlanStore((s) => s.data.settings.export)
  const setExportSettings = usePlanStore((s) => s.setExportSettings)

  const [period, setPeriod] = useState<ExportPeriod>('week')
  const [copied, setCopied] = useState(false)

  const anchorDate = useMemo(() => {
    if (period === 'day') return parseDate(agendaDate)
    return parseDate(weekAnchor)
  }, [period, agendaDate, weekAnchor])

  const text = useMemo(
    () =>
      exportPlanText(data, {
        period,
        anchorDate,
        includeDone: exportSettings.includeDone,
        skipEmptyDays: exportSettings.skipEmptyDays,
        title: exportSettings.exportTitle,
        includeRecentDone: exportSettings.includeRecentDone,
        recentDoneDays: exportSettings.recentDoneDays,
        includeInbox: exportSettings.includeInbox,
      }),
    [data, period, anchorDate, exportSettings],
  )

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plan-telegram.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal open={open} onClose={onClose} title="Текст для Telegram" size="lg">
      <div className="export-text-modal">
        <SegmentedControl className="export-period-tabs" aria-label="Период выгрузки">
          {PERIODS.map((p) => (
            <SegmentedControlItem
              key={p.id}
              active={period === p.id}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>

        <div className="export-text-options">
          <ThemedCheckbox
            checked={exportSettings.includeInbox}
            onChange={(v) => setExportSettings({ includeInbox: v })}
          >
            Включать задачи без срока
          </ThemedCheckbox>
          <ThemedCheckbox
            checked={exportSettings.includeRecentDone}
            onChange={(v) => setExportSettings({ includeRecentDone: v })}
          >
            Добавить сделанное за период (кратко)
          </ThemedCheckbox>
          {exportSettings.includeRecentDone && (
            <label className="export-recent-days">
              <span>За последние</span>
              <select
                className="form-input form-input-inline"
                value={exportSettings.recentDoneDays}
                onChange={(e) =>
                  setExportSettings({ recentDoneDays: Number(e.target.value) })
                }
              >
                {RECENT_DONE_DAY_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} дн.
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <textarea className="form-input export-text-preview" readOnly value={text} rows={16} />
        <div className="export-text-actions">
          <button type="button" className="btn btn-primary" onClick={() => void handleCopy()}>
            {copied ? 'Скопировано!' : 'Скопировать'}
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            Сохранить .txt
          </button>
        </div>
      </div>
    </Modal>
  )
}
