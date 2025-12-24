import { Modal } from './Modal'
import { t } from '../locales'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = t.common.confirm,
  cancelText = t.common.cancel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={(
        <>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
          >
            {confirmText}
          </button>
        </>
      )}
    >
      {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
    </Modal>
  )
}
