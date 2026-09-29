import { usePlanStore } from '../../../store/planStore'
import { PaletteToggle } from '../../layout/PaletteToggle'
import { ThemeToggle } from '../../layout/ThemeToggle'
import { CustomThemeSection } from '../CustomThemeSection'
import { SettingsSection } from '../SettingsSection'

export function AppearancePanel({ query }: { query: string }) {
  const ambientAnimation = usePlanStore((s) => s.data.settings.ambientAnimation)
  const setAmbientAnimation = usePlanStore((s) => s.setAmbientAnimation)
  const customThemeEnabled = usePlanStore((s) => s.data.settings.customTheme.enabled)

  return (
    <>
      <SettingsSection id="theme" hint="Светлая, тёмная или по системе." query={query}>
        <ThemeToggle />
      </SettingsSection>

      <SettingsSection
        id="palette"
        hint="Палитра или «Моя тема». Свои цвета сохраняются."
        query={query}
      >
        <PaletteToggle />
        <CustomThemeSection />
      </SettingsSection>

      <SettingsSection
        id="ambient"
        hint={
          customThemeEnabled
            ? 'У «Классики» анимации нет. У «Моей темы» — как у палитры-основы.'
            : 'У «Классики» анимации нет.'
        }
        query={query}
      >
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
      </SettingsSection>
    </>
  )
}
