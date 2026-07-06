import { useRef } from 'react'
import { usePlanStore } from '../../store/planStore'
import {
  type CustomThemeSettings,
} from '../../types'
import {
  exportThemeJson,
  importThemeJson,
} from '../../lib/customTheme'

const COLOR_FIELDS: { key: keyof CustomThemeSettings; label: string }[] = [
  { key: 'accent', label: 'Акцент' },
  { key: 'background', label: 'Фон' },
  { key: 'surface', label: 'Панели' },
  { key: 'text', label: 'Текст' },
]

const MAX_BG_BYTES = 1_500_000

export function CustomThemeSection() {
  const customTheme = usePlanStore((s) => s.data.settings.customTheme)
  const setCustomTheme = usePlanStore((s) => s.setCustomTheme)
  const resetCustomTheme = usePlanStore((s) => s.resetCustomTheme)
  const importRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<CustomThemeSettings>) => {
    setCustomTheme({ ...customTheme, ...patch, enabled: true })
  }

  const onBgFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > MAX_BG_BYTES) {
      alert('Изображение слишком большое (макс. ~1.5 МБ)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      update({ backgroundImage: result, enabled: true })
    }
    reader.readAsDataURL(file)
  }

  const onExport = () => {
    const blob = new Blob([exportThemeJson(customTheme)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'runeboard-theme.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const imported = importThemeJson(text)
      if (!imported) {
        alert('Не удалось прочитать файл темы')
        return
      }
      setCustomTheme({ ...imported, enabled: true })
    }
    reader.readAsText(file)
  }

  return (
    <div className="custom-theme-section">
      <label className="settings-check">
        <input
          type="checkbox"
          checked={customTheme.enabled}
          onChange={(e) =>
            setCustomTheme({
              ...customTheme,
              enabled: e.target.checked,
            })
          }
        />
        <span>Своя тема (цвета поверх выбранной палитры)</span>
      </label>

      {customTheme.enabled && (
        <>
          <div className="custom-theme-colors">
            {COLOR_FIELDS.map(({ key, label }) => (
              <label key={key} className="custom-theme-color-field">
                <span>{label}</span>
                <input
                  type="color"
                  value={customTheme[key] as string}
                  onChange={(e) => update({ [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <div className="settings-radio-row">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => bgRef.current?.click()}
            >
              Фоновое изображение
            </button>
            {customTheme.backgroundImage && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => update({ backgroundImage: null })}
              >
                Убрать фон
              </button>
            )}
          </div>
          <input
            ref={bgRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => {
              onBgFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />

          <label className="settings-check">
            <input
              type="checkbox"
              checked={customTheme.ambientEnabled}
              onChange={(e) => update({ ambientEnabled: e.target.checked })}
            />
            <span>Фоновая анимация (по выбранной палитре)</span>
          </label>

          <div className="settings-radio-row">
            <button type="button" className="btn btn-sm" onClick={onExport}>
              Экспорт темы
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => importRef.current?.click()}
            >
              Импорт темы
            </button>
            <button type="button" className="btn btn-sm" onClick={resetCustomTheme}>
              Сброс к «Классика»
            </button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </>
      )}

      {!customTheme.enabled && (
        <p className="settings-hint">
          По умолчанию — палитра «Классика» без декора. Включите свою тему для
          произвольных цветов и фона.
        </p>
      )}
    </div>
  )
}
