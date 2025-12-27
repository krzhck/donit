import { useCallback, useEffect, useState } from 'react'
import { Modal } from './Modal'
import { t } from '../locales'
import { categoriesApi, type Category } from '../api/Client'

interface CreateTodoModalProps {
  open: boolean
  initialTitle?: string
  initialDescription?: string
  initialTaskDate?: string
  initialCategoryId?: number
  mode?: 'create' | 'edit'
  onSave: (payload: { title: string; description?: string; taskDate?: string | null; categoryId?: number }) => void
  onCancel: () => void
}

export function CreateTodoModal({
  open,
  initialTitle = '',
  initialDescription = '',
  initialTaskDate,
  initialCategoryId,
  mode = 'create',
  onSave,
  onCancel,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const res = await categoriesApi.getAll()
      setCategories(res.data ?? [])
    } catch (err) {
      // 错误由全局拦截器处理
    } finally {
      setIsLoadingCategories(false)
    }
  }, [])

  const handleAddCategory = useCallback(async () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    setIsCreatingCategory(true)
    try {
      const res = await categoriesApi.create({ name: trimmed })
      if (res.data) {
        setCategories(prev => [...prev, res.data])
        setCategoryId(res.data.id)
        setNewCategory('')
      }
    } catch (err) {
      // 错误由全局拦截器处理
    } finally {
      setIsCreatingCategory(false)
    }
  }, [newCategory])

  useEffect(() => {
    if (open) {
      setTitle(initialTitle || '')
      setDescription(initialDescription || '')
      setTaskDate(initialTaskDate || '')
      setCategoryId(initialCategoryId)
      loadCategories().then(() => {
        // Set default category if none provided
        if (!initialCategoryId) {
          categoriesApi.getAll().then(res => {
            if (res.data && res.data.length > 0) {
              setCategoryId(res.data[0].id)
            }
          })
        }
      })
    } else {
      // Reset all states when modal closes
      setTitle('')
      setDescription('')
      setTaskDate('')
      setCategoryId(undefined)
      setNewCategory('')
    }
  }, [open, initialTitle, initialDescription, initialTaskDate, initialCategoryId, loadCategories])

  const handleSave = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const finalTaskDate = taskDate.trim() || null
    onSave({ title: trimmedTitle, description: description.trim() || undefined, taskDate: finalTaskDate, categoryId })
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
            className="btn btn-danger"
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
          <span className="form-label-text">{t.task.descriptionLabel}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.task.descriptionPlaceholder}
            className="form-input"
            rows={3}
          />
        </label>
        <label className="form-label">
          <span className="form-label-text">{t.task.dateLabel}</span>
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="form-input"
          />
        </label>
        <label className="form-label">
          <span className="form-label-text">{t.task.categoryLabel}</span>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            className="form-input"
          >
            {!categoryId && <option value="">{t.task.categoryNewPlaceholder}</option>}
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {isLoadingCategories && (
            <p className="text-sm text-gray-500">{t.task.categoryLoading}</p>
          )}
        </label>
        <div className="form-label flex items-center gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t.task.categoryNewPlaceholder}
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={!newCategory.trim() || isCreatingCategory}
            className="btn btn-secondary"
          >
            {t.task.categoryAdd}
          </button>
        </div>
      </div>
    </Modal>
  )
}
