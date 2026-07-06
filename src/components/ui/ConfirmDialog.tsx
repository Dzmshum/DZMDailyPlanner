import { useConfirmStore } from '../../store/confirmStore'
import { Modal } from './Modal'

export function ConfirmDialog() {
  const open = useConfirmStore((s) => s.open)
  const title = useConfirmStore((s) => s.title)
  const message = useConfirmStore((s) => s.message)
  const confirmLabel = useConfirmStore((s) => s.confirmLabel)
  const danger = useConfirmStore((s) => s.danger)
  const resolve = useConfirmStore((s) => s.resolve)

  return (
    <Modal
      open={open}
      onClose={() => resolve(false)}
      title={title}
      footer={
        <>
          <button className="btn" onClick={() => resolve(false)}>
            Отмена
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => resolve(true)}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  )
}
