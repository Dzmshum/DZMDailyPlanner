import type { PlanData } from '../../types'
import { usePlanStore } from '../../store/planStore'
import { Modal } from './Modal'

interface ImportModalProps {
  open: boolean
  plan: PlanData | null
  fileName?: string
  onClose: () => void
}

export function ImportModal({ open, plan, fileName, onClose }: ImportModalProps) {
  const importPlan = usePlanStore((s) => s.importPlan)
  const persist = usePlanStore((s) => s.persist)

  if (!plan) return null

  const handleImport = async (mode: 'replace' | 'merge') => {
    importPlan(plan, mode)
    await persist()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Импорт плана"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Отмена
          </button>
          <button className="btn" onClick={() => void handleImport('merge')}>
            Объединить
          </button>
          <button
            className="btn btn-danger"
            onClick={() => void handleImport('replace')}
          >
            Заменить всё
          </button>
        </>
      }
    >
      {fileName && (
        <p className="import-file-name">
          Файл: <code>{fileName}</code>
        </p>
      )}
      <p className="confirm-message">
        В файле: <strong>{plan.tasks.length}</strong> задач,{' '}
        <strong>{plan.projects.length}</strong> проектов.
      </p>
      <ul className="import-hints">
        <li>
          <strong>Объединить</strong> — добавить новые задачи и проекты (по id, без
          дублей). Настройки останутся текущими.
        </li>
        <li>
          <strong>Заменить всё</strong> — текущий план будет полностью заменён
          содержимым файла.
        </li>
      </ul>
    </Modal>
  )
}
