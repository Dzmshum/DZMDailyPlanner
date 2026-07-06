import { useState } from 'react'
import { VIEW_LABELS } from '../../types'
import type { PlanData } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { exportPlanToFile, parsePlanJson, pickPlanFileContent } from '../../lib/storage'
import { WindowControls } from './WindowControls'
import { ImportModal } from '../ui/ImportModal'
import { ViewIcon } from './ViewIcon'
import { DropdownMenu } from '../ui/DropdownMenu'

export function Header() {
  const currentView = usePlanStore((s) => s.currentView)
  const openNewTask = usePlanStore((s) => s.openNewTask)
  const openExportText = usePlanStore((s) => s.openExportText)
  const saving = usePlanStore((s) => s.saving)
  const data = usePlanStore((s) => s.data)

  const [importOpen, setImportOpen] = useState(false)
  const [importPlan, setImportPlan] = useState<PlanData | null>(null)
  const [importFileName, setImportFileName] = useState<string>()
  const [importError, setImportError] = useState('')

  const handleImport = async () => {
    setImportError('')
    try {
      const picked = await pickPlanFileContent()
      if (!picked) return
      const parsed = parsePlanJson(picked.content)
      setImportPlan(parsed)
      setImportFileName(picked.fileName)
      setImportOpen(true)
    } catch {
      setImportError('Не удалось прочитать файл. Проверьте формат JSON.')
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportPlan(null)
    setImportFileName(undefined)
  }

  return (
    <>
      <header className="header titlebar">
        <div className="header-leading titlebar-drag">
          <ViewIcon view={currentView} size="sm" />
          <h1 className="header-title">{VIEW_LABELS[currentView]}</h1>
        </div>
        <div className="header-actions titlebar-no-drag">
          {saving && <span className="saving-indicator">Сохранение...</span>}
          {importError && (
            <span className="header-error" title={importError}>
              {importError}
            </span>
          )}
          <button className="btn btn-primary" onClick={openNewTask} title="N">
            + Задача
          </button>
          <DropdownMenu
            label="Данные"
            items={[
              {
                id: 'export-text',
                label: 'Текст для Telegram',
                hint: 'Ctrl+Shift+C',
                onClick: openExportText,
              },
              {
                id: 'export-json',
                label: 'Экспорт JSON',
                hint: 'Ctrl+E',
                onClick: () => void exportPlanToFile(data),
              },
              {
                id: 'import-json',
                label: 'Импорт JSON',
                separatorBefore: true,
                onClick: () => void handleImport(),
              },
            ]}
          />
          <WindowControls />
        </div>
      </header>

      <ImportModal
        open={importOpen}
        plan={importPlan}
        fileName={importFileName}
        onClose={closeImport}
      />
    </>
  )
}
