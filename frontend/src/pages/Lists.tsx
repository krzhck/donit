import { useEffect, useMemo, useState } from 'react'
import { TaskList } from '../components/TaskList'
import { t } from '../locales'
import { categoriesApi, todoApi, type Category, type Todo } from '../api/Client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

export default function Lists() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({})
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteTaskCount, setDeleteTaskCount] = useState<number>(0)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await categoriesApi.getAll()
        const cats = (res.data ?? []).filter(c => (c.name || '').toLowerCase() !== 'inbox')
        setCategories(cats)
        const initialOpen: Record<number, boolean> = {}
        cats.forEach(c => { initialOpen[c.id] = false })
        setOpenMap(initialOpen)
      } catch (err) {
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const toggleCategory = (id: number) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const startRename = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setEditingName(cat.name)
  }

  const cancelRename = () => {
    setEditingCategoryId(null)
    setEditingName('')
  }

  const confirmRename = async () => {
    if (!editingCategoryId) return
    const newName = editingName.trim()
    if (!newName) return
    // 重复校验
    const isDuplicate = categories.some(c => c.id !== editingCategoryId && c.name.trim().toLowerCase() === newName.toLowerCase())
    if (isDuplicate) return
    try {
      await categoriesApi.update(editingCategoryId, { name: newName })
      setCategories(prev => prev.map(c => c.id === editingCategoryId ? { ...c, name: newName } : c))
    } catch (err) {
      // 错误由拦截器提示
    } finally {
      cancelRename()
    }
  }

  const requestDelete = async (cat: Category) => {
    setCategoryToDelete(cat)
    try {
      const res = await todoApi.getAll()
      const tasks = res.data ?? []
      const count = tasks.filter((todo: Todo) => {
        const catVal = todo.category
        if (typeof catVal === 'object' && catVal && 'id' in catVal) {
          return catVal.id === cat.id
        }
        if (typeof catVal === 'string') {
          return catVal.trim().toLowerCase() === cat.name.trim().toLowerCase()
        }
        return false
      }).length
      setDeleteTaskCount(count)
    } catch (err) {
      setDeleteTaskCount(0)
    } finally {
      setIsConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    try {
      // 先删除该分类下的所有任务
      const res = await todoApi.getAll()
      const tasks = res.data ?? []
      const tasksToDelete = tasks.filter((todo: Todo) => {
        const cat = todo.category
        if (typeof cat === 'object' && cat && 'id' in cat) {
          return cat.id === categoryToDelete.id
        }
        if (typeof cat === 'string') {
          return cat.trim().toLowerCase() === categoryToDelete.name.trim().toLowerCase()
        }
        return false
      })
      // 并发删除任务
      await Promise.all(tasksToDelete.map(t => todoApi.delete(t.id)))

      // 删除分类本身
      await categoriesApi.delete(categoryToDelete.id)
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
      setOpenMap(prev => {
        const copy = { ...prev }
        delete copy[categoryToDelete.id]
        return copy
      })
    } catch (err) {
      // 错误由拦截器提示
    } finally {
      setIsConfirmOpen(false)
      setCategoryToDelete(null)
    }
  }

  const nonInboxCategories = useMemo(() => categories, [categories])

  const startAddCategory = () => {
    setIsAddingCategory(true)
  }

  const cancelAddCategory = () => {
    setIsAddingCategory(false)
    setNewCategoryName('')
    setIsCreatingCategory(false)
  }

  const confirmAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    if (categories.some(c => c.name.trim().toLowerCase() === name.toLowerCase())) return
    setIsCreatingCategory(true)
    try {
      const res = await categoriesApi.create({ name })
      const created = res.data
      if (created) {
        // 若新分类名为 inbox，将被非收件箱过滤器隐藏；这里仍然加入列表以保持状态一致
        setCategories(prev => [...prev, created])
        setOpenMap(prev => ({ ...prev, [created.id]: false }))
        cancelAddCategory()
      }
    } catch (err) {
      // 错误由拦截器提示
    } finally {
      setIsCreatingCategory(false)
    }
  }

  return (
    <div className="px-8 pt-8 pb-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">{t.lists.title}</h2>
          <p className="page-subtitle">{t.lists.subtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="list-loading">
          <div className="list-loading-spinner"></div>
          <p className="list-loading-text">{t.common.loading}</p>
        </div>
      ) : nonInboxCategories.length === 0 ? (
        <div className="list-empty-state">
          <svg className="list-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="list-empty-title">{t.inbox.emptyTitle}</p>
          <p className="list-empty-subtitle">{t.inbox.emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {nonInboxCategories.map(cat => (
            <div key={cat.id} className="rounded-lg">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md"
                    aria-label={openMap[cat.id] ? '收起' : '展开'}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {openMap[cat.id] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  {editingCategoryId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="form-input h-8"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            confirmRename()
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelRename()
                          }
                        }}
                      />
                      {/* 校验提示 */}
                      <span className="text-sm text-red-500">
                        {!editingName.trim() ? t.category.renameEmptyError :
                          categories.some(c => c.id !== editingCategoryId && c.name.trim().toLowerCase() === editingName.trim().toLowerCase()) ? t.category.renameDuplicateError : ''}
                      </span>
                      <button
                        className="btn btn-action btn-secondary"
                        onClick={confirmRename}
                        disabled={!editingName.trim() || categories.some(c => c.id !== editingCategoryId && c.name.trim().toLowerCase() === editingName.trim().toLowerCase())}
                      >
                        {t.category.renameSave}
                      </button>
                      <button className="btn btn-action btn-secondary" onClick={cancelRename}>{t.category.renameCancel}</button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-action btn-secondary" onClick={() => startRename(cat)}>{t.common.rename}</button>
                  <button className="btn btn-action btn-secondary" onClick={() => requestDelete(cat)}>{t.common.delete}</button>
                </div>
              </div>
              {openMap[cat.id] && (
                <div className="px-2 pb-4">
                  <TaskList
                    title={cat.name}
                    hideHeader
                    emptyTitle={t.inbox.emptyTitle}
                    emptySubtitle={t.inbox.emptySubtitle}
                    filter={{ categoryId: cat.id }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* 添加分类 */}
          <div className="px-4">
            {isAddingCategory ? (
              <div className="flex items-center gap-2">
                <input
                  className="form-input h-8 max-w-xs"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t.task.categoryNewPlaceholder}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void confirmAddCategory()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      cancelAddCategory()
                    }
                  }}
                />
                <span className="text-sm text-red-500">
                  {!newCategoryName.trim() ? t.category.renameEmptyError :
                    categories.some(c => c.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase()) ? t.category.renameDuplicateError : ''}
                </span>
                <button
                  className="btn btn-action btn-secondary"
                  onClick={() => void confirmAddCategory()}
                  disabled={!newCategoryName.trim() || categories.some(c => c.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase()) || isCreatingCategory}
                >
                  {t.common.save}
                </button>
                <button
                  className="btn btn-action btn-secondary"
                  onClick={cancelAddCategory}
                  disabled={isCreatingCategory}
                >
                  {t.common.cancel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-action btn-secondary flex items-center gap-2"
                onClick={startAddCategory}
              >
                <Plus size={16} />
                {t.task.categoryAdd}
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title={t.category.deleteConfirmTitle}
        description={t.category.deleteConfirmWithCount.replace('{count}', String(deleteTaskCount))}
        confirmText={t.common.confirm}
        cancelText={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false)
          setCategoryToDelete(null)
          setDeleteTaskCount(0)
        }}
      />
    </div>
  )
}
