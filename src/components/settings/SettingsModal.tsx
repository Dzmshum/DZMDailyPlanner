import { useEffect, useState } from 'react'
import type { JiraSettings } from '../../types'
import { RECENT_DONE_DAY_OPTIONS } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { formatDailyDaysLabel } from '../../lib/dailyLabels'
import { getPlanFilePath, usesSharedPlanFile } from '../../lib/storage'
import { isElectron } from '../../lib/electron'
import { Modal } from '../ui/Modal'
import { PaletteToggle } from '../layout/PaletteToggle'
import { CustomThemeSection } from './CustomThemeSection'
import { DailyDaysPicker } from './DailyDaysPicker'
import { ThemeToggle } from '../layout/ThemeToggle'
import { ThemedCheckbox } from '../ui/ThemedCheckbox'

type SettingsTab = 'appearance' | 'behavior' | 'data' | 'integrations'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'appearance', label: 'Оформление' },
  { id: 'behavior', label: 'Поведение' },
  { id: 'data', label: 'Данные' },
  { id: 'integrations', label: 'Интеграции' },
]

export function SettingsModal() {
  const open = usePlanStore((s) => s.settingsOpen)
  const closeSettings = usePlanStore((s) => s.closeSettings)
  const jira = usePlanStore((s) => s.data.settings.jira)
  const setJiraSettings = usePlanStore((s) => s.setJiraSettings)
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const setWindowMode = usePlanStore((s) => s.setWindowMode)
  const calendar = usePlanStore((s) => s.data.settings.calendar)
  const setCalendarSettings = usePlanStore((s) => s.setCalendarSettings)
  const daily = usePlanStore((s) => s.data.settings.daily)
  const setDailySettings = usePlanStore((s) => s.setDailySettings)
  const dayProgress = usePlanStore((s) => s.data.settings.dayProgress)
  const setDayProgressSettings = usePlanStore((s) => s.setDayProgressSettings)
  const exportSettings = usePlanStore((s) => s.data.settings.export)
  const setExportSettings = usePlanStore((s) => s.setExportSettings)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const setVoiceInputEnabled = usePlanStore((s) => s.setVoiceInputEnabled)
  const ambientAnimation = usePlanStore((s) => s.data.settings.ambientAnimation)
  const setAmbientAnimation = usePlanStore((s) => s.setAmbientAnimation)
  const customThemeEnabled = usePlanStore((s) => s.data.settings.customTheme.enabled)

  const [tab, setTab] = useState<SettingsTab>('appearance')
  const [planPath, setPlanPath] = useState<string | null>(null)
  const [sharedFile, setSharedFile] = useState(false)

  useEffect(() => {
    if (open) setTab('appearance')
  }, [open])

  useEffect(() => {
    if (!open) return
    void usesSharedPlanFile().then(setSharedFile)
    void getPlanFilePath().then(setPlanPath)
  }, [open])

  const patchJira = (updates: Partial<JiraSettings>) =>
    setJiraSettings({ ...jira, ...updates })

  const dailyDaysLabel = formatDailyDaysLabel(daily.days)

  return (
    <Modal open={open} onClose={closeSettings} title="Настройки" size="xl">
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Разделы настроек">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`settings-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="settings-panel">
          {tab === 'appearance' && (
            <div className="settings-section settings-section-last">
              <h3 className="settings-section-title">Тема интерфейса</h3>
              <p className="settings-hint">Светлая, тёмная или по системе. Сохраняется автоматически.</p>
              <ThemeToggle />

              <h3 className="settings-section-title settings-section-title-spaced">
                Тема оформления
              </h3>
              <p className="settings-hint">
                Одна активная тема — встроенная палитра или «Моя тема». Цвета своей темы
                сохраняются при переключении.
              </p>
              <PaletteToggle />
              <CustomThemeSection />

              <h3 className="settings-section-title settings-section-title-spaced">
                Фоновая анимация
              </h3>
              <p className="settings-hint">
                Для «Классика» анимация отключена. Для остальных — снежинки, звёзды и т.д.
                {customThemeEnabled && ' У «Моей темы» наследуется анимация палитры-основы.'}
              </p>
              <div className="settings-radio-row">
                {(
                  [
                    ['auto', 'По палитре'],
                    ['off', 'Выключить'],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn btn-sm ${ambientAnimation === mode ? 'btn-primary' : ''}`}
                    onClick={() => setAmbientAnimation(mode)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {isElectron() && (
                <>
                  <h3 className="settings-section-title settings-section-title-spaced">
                    Режим окна
                  </h3>
                  <p className="settings-hint">Только Electron. Минимальный — справа сверху.</p>
                  <div className="settings-radio-row">
                    {(
                      [
                        ['standard', 'Обычный'],
                        ['maximized', 'Развёрнутый'],
                        ['minimal', 'Минимальный'],
                      ] as const
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        className={`btn btn-sm ${windowMode === mode ? 'btn-primary' : ''}`}
                        onClick={() => setWindowMode(mode)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'behavior' && (
            <div className="settings-section settings-section-last">
              <h3 className="settings-section-title">Календарь</h3>
              <ThemedCheckbox
                className="settings-check"
                checked={calendar.showHolidays}
                onChange={(v) => setCalendarSettings({ showHolidays: v })}
              >
                Показывать праздники РФ
              </ThemedCheckbox>

              <h3 className="settings-section-title settings-section-title-spaced">Дейлики</h3>
              <ThemedCheckbox
                className="settings-check"
                checked={daily.enabled}
                onChange={(v) => setDailySettings({ enabled: v })}
              >
                Отмечать дни дейликов ({dailyDaysLabel})
              </ThemedCheckbox>
              {daily.enabled && (
                <>
                  <p className="settings-hint">Дни созвонов (минимум один):</p>
                  <DailyDaysPicker
                    days={daily.days}
                    onChange={(days) => setDailySettings({ days })}
                  />
                </>
              )}

              <h3 className="settings-section-title settings-section-title-spaced">
                Прогресс дня
              </h3>
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

              <h3 className="settings-section-title settings-section-title-spaced">
                Экспорт текста
              </h3>
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
                    onChange={(e) =>
                      setExportSettings({ recentDoneDays: Number(e.target.value) })
                    }
                  >
                    {RECENT_DONE_DAY_OPTIONS.map((days) => (
                      <option key={days} value={days}>
                        {days} дней
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <h3 className="settings-section-title settings-section-title-spaced">
                Голосовой ввод
              </h3>
              <ThemedCheckbox
                className="settings-check"
                checked={voiceInputEnabled}
                onChange={setVoiceInputEnabled}
              >
                Кнопка микрофона во всех полях ввода текста (задачи, заметки, проекты)
              </ThemedCheckbox>
              <p className="settings-hint">Горячая клавиша: Ctrl+Shift+V</p>
            </div>
          )}

          {tab === 'data' && (
            <div className="settings-section settings-section-last">
              <h3 className="settings-section-title">Файл плана</h3>
              {sharedFile ? (
                <>
                  <p className="settings-hint">
                    План хранится в одном файле на диске.{' '}
                    {isElectron()
                      ? 'Пересборка и обновление .exe не удаляют ваши задачи.'
                      : 'В режиме pnpm dev браузер использует тот же файл, что и Electron.'}
                  </p>
                  {planPath && (
                    <p className="settings-path">
                      <span className="form-label">Файл данных</span>
                      <code>{planPath}</code>
                    </p>
                  )}
                  <p className="settings-hint">
                    Резервная копия: <code>plan.json.bak</code> в той же папке.
                    Импорт и экспорт — кнопки в шапке приложения.
                  </p>
                </>
              ) : (
                <p className="settings-hint">
                  Данные в localStorage браузера (отдельно от десктоп-версии).
                  Запустите <code>pnpm dev</code> или <code>pnpm electron:dev</code> для
                  общего файла на диске.
                </p>
              )}
            </div>
          )}

          {tab === 'integrations' && (
            <div className="settings-section settings-section-last">
              <h3 className="settings-section-title">Jira Cloud</h3>
              <p className="settings-hint">
                Экспорт задач в Jira Cloud через REST API. Токен создаётся в{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                >
                  Atlassian Account → API tokens
                </a>
                . Сохраняется автоматически. Работает в Electron.
              </p>

              <ThemedCheckbox
                className="settings-check"
                checked={jira.enabled}
                onChange={(v) => patchJira({ enabled: v })}
              >
                Включить экспорт в Jira
              </ThemedCheckbox>

              <div className="form-group">
                <label className="form-label">URL Jira</label>
                <input
                  className="form-input"
                  placeholder="https://company.atlassian.net"
                  value={jira.baseUrl}
                  onChange={(e) => patchJira({ baseUrl: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@company.com"
                    value={jira.email}
                    onChange={(e) => patchJira({ email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">API Token</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={jira.apiToken}
                    onChange={(e) => patchJira({ apiToken: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ключ проекта</label>
                  <input
                    className="form-input"
                    placeholder="PROJ"
                    value={jira.projectKey}
                    onChange={(e) => patchJira({ projectKey: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Тип задачи</label>
                  <input
                    className="form-input"
                    placeholder="Task"
                    value={jira.issueType}
                    onChange={(e) => patchJira({ issueType: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
