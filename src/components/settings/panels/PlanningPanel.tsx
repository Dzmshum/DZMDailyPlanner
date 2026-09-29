import { usePlanStore } from '../../../store/planStore'
import { formatDailyDaysLabel } from '../../../lib/dailyLabels'
import { ThemedCheckbox } from '../../ui/ThemedCheckbox'
import { DailyDaysPicker } from '../DailyDaysPicker'
import { SettingsSection } from '../SettingsSection'

export function PlanningPanel({ query }: { query: string }) {
  const calendar = usePlanStore((s) => s.data.settings.calendar)
  const setCalendarSettings = usePlanStore((s) => s.setCalendarSettings)
  const daily = usePlanStore((s) => s.data.settings.daily)
  const setDailySettings = usePlanStore((s) => s.setDailySettings)
  const dayProgress = usePlanStore((s) => s.data.settings.dayProgress)
  const setDayProgressSettings = usePlanStore((s) => s.setDayProgressSettings)
  const dailyDaysLabel = formatDailyDaysLabel(daily.days)

  return (
    <>
      <SettingsSection id="calendar" query={query}>
        <ThemedCheckbox
          className="settings-check"
          checked={calendar.showHolidays}
          onChange={(v) => setCalendarSettings({ showHolidays: v })}
        >
          Показывать праздники РФ
        </ThemedCheckbox>
      </SettingsSection>

      <SettingsSection id="daily" query={query}>
        <ThemedCheckbox
          className="settings-check"
          checked={daily.enabled}
          onChange={(v) => setDailySettings({ enabled: v })}
        >
          Отмечать дни дейликов ({dailyDaysLabel})
        </ThemedCheckbox>
        {daily.enabled && (
          <>
            <p className="settings-hint">Дни созвонов, минимум один.</p>
            <DailyDaysPicker days={daily.days} onChange={(days) => setDailySettings({ days })} />
          </>
        )}
      </SettingsSection>

      <SettingsSection id="progress" query={query}>
        <ThemedCheckbox
          className="settings-check"
          checked={dayProgress.showOnAgenda}
          onChange={(v) => setDayProgressSettings({ showOnAgenda: v })}
        >
          Показывать в повестке дня
        </ThemedCheckbox>
        <ThemedCheckbox
          className="settings-check"
          checked={dayProgress.showOnDashboard}
          onChange={(v) => setDayProgressSettings({ showOnDashboard: v })}
        >
          Показывать на дашборде (блок «Сегодня»)
        </ThemedCheckbox>
        <ThemedCheckbox
          className="settings-check"
          checked={dayProgress.showPercent}
          onChange={(v) => setDayProgressSettings({ showPercent: v })}
        >
          Показывать процент
        </ThemedCheckbox>
        <ThemedCheckbox
          className="settings-check"
          checked={dayProgress.showFraction}
          onChange={(v) => setDayProgressSettings({ showFraction: v })}
        >
          Показывать счётчик задач
        </ThemedCheckbox>
      </SettingsSection>
    </>
  )
}
