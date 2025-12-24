import { Modal } from './Modal'
import { t } from '../locales'

interface TodoPreview {
  id: number
  title: string
  completed: boolean
  dueDate?: string
}

interface TodoPreviewModalProps {
  open: boolean
  todo: TodoPreview | null
  onClose: () => void
  onEdit?: (todo: TodoPreview) => void
}

export function TodoPreviewModal({ open, todo, onClose, onEdit }: TodoPreviewModalProps) {
  if (!todo) return null

  const formattedDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString()
    : t.task.noDate

  return (
    <Modal
      open={open}
      title={t.modal.detailsTitle}
      onClose={onClose}
      widthClass="max-w-lg"
      footer={(
        <>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            {t.common.close}
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(todo)}
              className="btn btn-danger"
            >
              {t.common.edit}
            </button>
          )}
        </>
      )}
    >
      <div className="preview-content">
        <div className="preview-meta">
          <span className={`badge ${todo.completed ? 'badge-completed' : 'badge-pending'}`}>
            {todo.completed ? t.task.statusCompleted : t.task.statusPending}
          </span>
          <span className="text-sm text-gray-500">{t.modal.dueLabel}：{formattedDate}</span>
        </div>
        <p className="preview-text">{todo.title}</p>
      </div>
    </Modal>
  )
}
