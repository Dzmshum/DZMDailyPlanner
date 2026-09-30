import { usePlanStore } from '../../../store/planStore'
import { isElectron } from '../../../lib/electron'
import { ThemedCheckbox } from '../../ui/ThemedCheckbox'
import { SettingsSection } from '../SettingsSection'

const HOTKEYS: { keys: string; action: string }[] = [
  { keys: '1–6', action: 'Пункты меню сверху вниз' },
  { keys: '[', action: 'Полное меню или круговое' },
  { keys: 'Q', action: 'Быстрый захват' },
  { keys: 'N', action: 'Новая задача' },
  { keys: 'Пробел', action: 'Отметить выбранную задачу' },
  { keys: 'Ctrl+S', action: 'Сохранить' },
  { keys: 'Ctrl+E', action: 'Экспорт JSON' },
  { keys: 'Ctrl+F', action: 'Поиск' },
  { keys: 'Ctrl+Shift+C', action: 'Текст для Telegram' },
  { keys: 'Ctrl+Shift+V', action: 'Голос' },
  { keys: 'Esc', action: 'Закрыть форму' },
]

export function WindowPanel({ query }: { query: string }) {
  const windowMode = usePlanStore((s) => s.data.settings.windowMode)
  const setWindowMode = usePlanStore((s) => s.setWindowMode)
  const sidebarMode = usePlanStore((s) => s.data.settings.navigation.sidebarMode)
  const setSidebarMode = usePlanStore((s) => s.setSidebarMode)
  const voiceInputEnabled = usePlanStore((s) => s.data.settings.voiceInputEnabled)
  const setVoiceInputEnabled = usePlanStore((s) => s.setVoiceInputEnabled)

  return (
    <>
      <SettingsSection
        id="window-mode"
        hint={
          isElectron()
            ? 'Кнопка размера справа сверху: полный экран, средний, минимальный.'
            : 'Только в приложении Electron.'
        }
        query={query}
      >
        {isElectron() && (
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
        )}
      </SettingsSection>

      <SettingsSection
        id="sidebar"
        hint="[ переключает полное меню и круговое. В круговом логотип открывает разделы."
        query={query}
      >
        <div className="settings-radio-row">
          {(
            [
              ['expanded', 'Полное'],
              ['radial', 'Круговое'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={`btn btn-sm ${sidebarMode === mode ? 'btn-primary' : ''}`}
              onClick={() => setSidebarMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection id="voice" hint="Ctrl+Shift+V" query={query}>
        <ThemedCheckbox
          className="settings-check"
          checked={voiceInputEnabled}
          onChange={setVoiceInputEnabled}
        >
          Кнопка микрофона в полях текста
        </ThemedCheckbox>
      </SettingsSection>

      <SettingsSection id="hotkeys" query={query}>
        <dl className="settings-hotkeys">
          {HOTKEYS.map((item) => (
            <div key={item.keys} className="settings-hotkey">
              <dt>{item.keys}</dt>
              <dd>{item.action}</dd>
            </div>
          ))}
        </dl>
      </SettingsSection>
    </>
  )
}
