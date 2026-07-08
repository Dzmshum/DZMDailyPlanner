import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { usePlanStore } from '../../store/planStore'
import {
  type CustomBackgroundImage,
  type CustomThemeSettings,
  type ColorPalette,
  PALETTE_LABELS,
} from '../../types'
import {
  applyCustomThemeVars,
  exportThemeJson,
  getActiveBackgroundImage,
  importThemeJson,
} from '../../lib/customTheme'
import { createCustomThemeFromPalette } from '../../lib/paletteThemeColors'
import { COLOR_PALETTE_IDS } from '../../lib/palettes'
import { ThemePreview } from './ThemePreview'

type ThemeColorKey = 'accent' | 'background' | 'surface' | 'text'

const COLOR_FIELDS: { key: ThemeColorKey; label: string }[] = [
  { key: 'accent', label: 'Акцент' },
  { key: 'background', label: 'Фон' },
  { key: 'surface', label: 'Панели' },
  { key: 'text', label: 'Текст' },
]

function ThemeColorInput({
  colorKey,
  value,
  theme,
  onCommit,
}: {
  colorKey: ThemeColorKey
  value: string
  theme: CustomThemeSettings
  onCommit: (key: ThemeColorKey, color: string) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? value

  useEffect(() => {
    setDraft(null)
  }, [value])

  const preview = (color: string) => {
    applyCustomThemeVars(document.documentElement, {
      ...theme,
      [colorKey]: color,
      enabled: true,
    })
  }

  return (
    <input
      type="color"
      value={display}
      onInput={(e) => {
        const color = e.currentTarget.value
        setDraft(color)
        preview(color)
      }}
      onChange={(e) => {
        const color = e.currentTarget.value
        setDraft(null)
        onCommit(colorKey, color)
      }}
      onBlur={() => setDraft(null)}
    />
  )
}

const MAX_BG_BYTES = 1_500_000
const MAX_BG_IMAGES = 24

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

export function CustomThemeSection() {
  const customTheme = usePlanStore((s) => s.data.settings.customTheme)
  const setCustomTheme = usePlanStore((s) => s.setCustomTheme)
  const resetCustomTheme = usePlanStore((s) => s.resetCustomTheme)
  const importRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)
  const activeBackground = getActiveBackgroundImage(customTheme)

  const update = (patch: Partial<CustomThemeSettings>) => {
    setCustomTheme({ ...customTheme, ...patch, enabled: true })
  }

  const createFromPalette = (palette: ColorPalette) => {
    setCustomTheme(createCustomThemeFromPalette(palette, customTheme))
  }

  const onBgFiles = async (files: FileList | undefined) => {
    if (!files?.length) return

    const remaining = MAX_BG_IMAGES - customTheme.backgroundImages.length
    if (remaining <= 0) {
      alert(`Максимум ${MAX_BG_IMAGES} фонов`)
      return
    }

    const toAdd: CustomBackgroundImage[] = []
    for (const file of Array.from(files).slice(0, remaining)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_BG_BYTES) {
        alert(`«${file.name}» слишком большое (макс. ~1.5 МБ)`)
        continue
      }
      const dataUrl = await readFileAsDataUrl(file)
      if (dataUrl) toAdd.push({ id: uuidv4(), dataUrl })
    }

    if (toAdd.length === 0) return

    const backgroundImages = [...customTheme.backgroundImages, ...toAdd]
    update({
      backgroundImages,
      backgroundImageId: toAdd[toAdd.length - 1].id,
    })
  }

  const selectBackground = (id: string) => {
    update({ backgroundImageId: id })
  }

  const clearBackground = () => {
    update({ backgroundImageId: null })
  }

  const removeBackground = (id: string) => {
    const backgroundImages = customTheme.backgroundImages.filter((img) => img.id !== id)
    let backgroundImageId = customTheme.backgroundImageId
    if (backgroundImageId === id) {
      backgroundImageId = backgroundImages[0]?.id ?? null
    }
    update({ backgroundImages, backgroundImageId })
  }

  const onExport = () => {
    const blob = new Blob([exportThemeJson(customTheme)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planboard-theme.json'
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

  if (!customTheme.enabled) {
    return (
      <div className="custom-theme-section custom-theme-empty">
        <p className="settings-hint">
          Выберите карточку «Моя тема» выше или создайте тему на основе любой палитры.
        </p>
        <div className="settings-radio-row">
          <span className="settings-label-inline">Создать на основе:</span>
          {COLOR_PALETTE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="btn btn-sm"
              onClick={() => createFromPalette(id)}
            >
              {PALETTE_LABELS[id]}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const basedOnLabel = customTheme.basedOn ? PALETTE_LABELS[customTheme.basedOn] : null

  return (
    <div className="custom-theme-section">
      {basedOnLabel && (
        <p className="settings-hint custom-theme-based-on">
          На основе палитры «{basedOnLabel}»
        </p>
      )}

      <ThemePreview theme={customTheme} />

      <div className="custom-theme-colors">
        {COLOR_FIELDS.map(({ key, label }) => (
          <label key={key} className="custom-theme-color-field">
            <span>{label}</span>
            <ThemeColorInput
              colorKey={key}
              value={customTheme[key]}
              theme={customTheme}
              onCommit={(colorKey, color) => update({ [colorKey]: color })}
            />
          </label>
        ))}
      </div>

      <div className="custom-theme-bg">
        <div className="settings-radio-row">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => bgRef.current?.click()}
          >
            Добавить фон
          </button>
          {activeBackground && (
            <button type="button" className="btn btn-sm" onClick={clearBackground}>
              Без фона
            </button>
          )}
        </div>

        {customTheme.backgroundImages.length > 0 && (
          <div className="custom-theme-bg-gallery" role="list" aria-label="Сохранённые фоны">
            {customTheme.backgroundImages.map((img) => {
              const active = img.id === customTheme.backgroundImageId
              return (
                <div
                  key={img.id}
                  className={`custom-theme-bg-tile${active ? ' active' : ''}`}
                  role="listitem"
                >
                  <button
                    type="button"
                    className="custom-theme-bg-tile-select"
                    onClick={() => selectBackground(img.id)}
                    title={active ? 'Текущий фон' : 'Выбрать фон'}
                    aria-pressed={active}
                  >
                    <img src={img.dataUrl} alt="" />
                  </button>
                  <button
                    type="button"
                    className="custom-theme-bg-tile-remove"
                    onClick={() => removeBackground(img.id)}
                    aria-label="Удалить фон"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p className="settings-hint">
          До {MAX_BG_IMAGES} изображений, макс. ~1.5 МБ каждое. Клик по плитке — выбрать фон.
        </p>
      </div>
      <input
        ref={bgRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(e) => {
          void onBgFiles(e.target.files ?? undefined)
          e.target.value = ''
        }}
      />

      <div className="settings-radio-row custom-theme-from-palette">
        <span className="settings-label-inline">Создать на основе:</span>
        {COLOR_PALETTE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="btn btn-sm"
            onClick={() => createFromPalette(id)}
          >
            {PALETTE_LABELS[id]}
          </button>
        ))}
      </div>

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
          Сбросить оформление
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
    </div>
  )
}
