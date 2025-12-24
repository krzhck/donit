import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { t } from '../locales'

interface CreateTodoModalProps {
  open: boolean
  initialTitle?: string
  initialDueDate?: string
  mode?: 'create' | 'edit'
  onSave: (payload: { title: string; dueDate?: string }) => void
  onCancel: () => void
}

export function CreateTodoModal({
  open,
  initialTitle = '',
  initialDueDate = '',
  mode = 'create',
  onSave,
  onCancel,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [dueDate, setDueDate] = useState(initialDueDate)

  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setDueDate(initialDueDate)
    }
  }, [open, initialTitle, initialDueDate])

  const handleSave = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    onSave({ title: trimmedTitle, dueDate: dueDate || undefined })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? t.modal.editTitle : t.modal.createTitle}
      onClose={onCancel}
      footer={(
        <>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="btn btn-danger btn-disabled"
          >
            {t.common.save}
          </button>
        </>
      )}
    >
      <div className="form-group">
        <label className="form-label">
          <span className="form-label-text">{t.task.contentLabel}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.task.placeholder}
            className="form-input"
          />
        </label>
        <label className="form-label">
          <span className="form-label-text">{t.task.dateLabel}</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
          />
        </label>
      </div>
    </Modal>
  )
}
