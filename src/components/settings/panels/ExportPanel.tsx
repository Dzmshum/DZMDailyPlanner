import { RECENT_DONE_DAY_OPTIONS } from '../../../types'
import { usePlanStore } from '../../../store/planStore'
import { ThemedCheckbox } from '../../ui/ThemedCheckbox'
import { SettingsSection } from '../SettingsSection'

export function ExportPanel({ query }: { query: string }) {
  const exportSettings = usePlanStore((s) => s.data.settings.export)
  const setExportSettings = usePlanStore((s) => s.setExportSettings)

  return (
    <SettingsSection id="export-text" query={query}>
      <ThemedCheckbox
        className="settings-check"
        checked={exportSettings.includeDone}
        onChange={(v) => setExportSettings({ includeDone: v })}
      >
        Включать выполненные задачи
      </ThemedCheckbox>
      <ThemedCheckbox
        className="settings-check"
        checked={exportSettings.skipEmptyDays}
        onChange={(v) => setExportSettings({ skipEmptyDays: v })}
      >
        Пропускать пустые дни
      </ThemedCheckbox>
      <ThemedCheckbox
        className="settings-check"
        checked={exportSettings.includeInbox}
        onChange={(v) => setExportSettings({ includeInbox: v })}
      >
        Включать задачи без срока
      </ThemedCheckbox>
      <ThemedCheckbox
        className="settings-check"
        checked={exportSettings.includeRecentDone}
        onChange={(v) => setExportSettings({ includeRecentDone: v })}
      >
        Добавлять сделанное за период (кратко)
      </ThemedCheckbox>
      {exportSettings.includeRecentDone && (
        <label className="settings-field">
          <span className="settings-label">Период для сделанного</span>
          <select
            className="form-input"
            value={exportSettings.recentDoneDays}
            onChange={(e) => setExportSettings({ recentDoneDays: Number(e.target.value) })}
          >
            {RECENT_DONE_DAY_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days} дней
              </option>
            ))}
          </select>
        </label>
      )}
    </SettingsSection>
  )
}
