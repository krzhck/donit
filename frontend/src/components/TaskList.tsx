import { useCallback, useEffect, useMemo, useState } from 'react'
import { Coffee } from 'lucide-react'
import { todoApi, type Todo } from '../api/Client'
import { useTodoModal, type TodoSavePayload } from '../contexts/TodoModalContext'
import { ConfirmDialog } from './ConfirmDialog'
import { TodoPreviewModal } from './TodoPreviewModal'
import { t } from '../locales'

// 前端显示类型
export interface LocalTodo {
  id: number
  title: string
  completed: boolean
  taskDate?: string
  description?: string
  category?: string
  categoryId?: number
}

// 占位任务（仅在需要时包含）
const placeholderTodos: LocalTodo[] = t.inbox.sampleTasks.map(sample => ({
  id: sample.id,
  title: sample.title,
  completed: sample.id === -3,
  taskDate: new Date(Date.now() + sample.offsetDays * 24 * 3600 * 1000).toISOString().slice(0, 10),
  category: 'inbox',
}))

// 转换后端任务到前端格式
function convertToLocalTodo(apiTodo: Todo): LocalTodo {
  const categoryValue = apiTodo.category
  const categoryName = typeof categoryValue === 'string'
    ? categoryValue
    : categoryValue?.name || 'inbox'
  const categoryId = typeof categoryValue === 'object' ? categoryValue?.id : undefined

  let taskDate: string | undefined
  if (apiTodo.task_date) {
    taskDate = apiTodo.task_date
  }

  return {
    id: apiTodo.id,
    title: apiTodo.title,
    completed: apiTodo.is_completed,
    description: apiTodo.description,
    taskDate,
    category: categoryName,
    categoryId,
  }
}

type TaskListFilter = {
  category?: string
  categoryId?: number
  taskDateIsToday?: boolean
  isCompleted?: boolean
}

interface TaskListProps {
  emptyTitle?: string
  emptySubtitle?: string
  filter?: TaskListFilter
  includePlaceholders?: boolean
  onStatsChange?: (completed: number, total: number) => void
  hideStats?: boolean
  hideContent?: boolean
}

export function TaskList({
  emptyTitle = t.inbox.emptyTitle,
  emptySubtitle = t.inbox.emptySubtitle,
  filter,
  includePlaceholders = false,
  onStatsChange,
  hideStats = false,
  hideContent = false,
}: TaskListProps) {
  const [allTodos, setAllTodos] = useState<LocalTodo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<LocalTodo | null>(null)
  const [todoToDelete, setTodoToDelete] = useState<LocalTodo | null>(null)
  const { openEditModal, registerSaveCallback } = useTodoModal()

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const filteredTodos = useMemo(() => {
    let source = allTodos
    if (includePlaceholders) {
      source = [...placeholderTodos, ...source]
    }
    return source.filter(t => {
      if (filter?.category && t.category !== filter.category) return false
      if (filter?.categoryId && t.categoryId !== filter.categoryId) return false
      if (filter?.taskDateIsToday) return t.taskDate === todayStr
      if (filter?.isCompleted !== undefined && t.completed !== filter.isCompleted) return false
      return true
    })
  }, [allTodos, filter, includePlaceholders, todayStr])

  const completedCount = useMemo(() => filteredTodos.filter(t => t.completed).length, [filteredTodos])

  useEffect(() => {
    onStatsChange?.(completedCount, filteredTodos.length)
  }, [completedCount, filteredTodos.length])

  const handleSaveTodo = useCallback(async (payload: TodoSavePayload) => {
    const { id, title, description, taskDate, categoryId } = payload

    // 编辑占位任务
    if (typeof id === 'number' && id < 0) {
      // 仅在列表视图中更新占位数据
      setAllTodos(prev => prev.map(t => t.id === id ? { ...t, title, taskDate: taskDate ?? undefined } : t))
      return
    }

    // 编辑真实任务
    if (typeof id === 'number') {
      try {
        const updatePayload = {
          title,
          description,
          category_id: categoryId,
          task_date: taskDate ?? undefined,
        }
        await todoApi.update(id, updatePayload)
        const res = await todoApi.getAll()
        const updated = res.data.find(t => t.id === id)
        if (updated) {
          const updatedLocal = convertToLocalTodo(updated)
          setAllTodos(prev => prev.map(t => t.id === id ? updatedLocal : t))
        }
      } catch (err) {
        // axios 拦截器处理
      }
      return
    }

    // 创建新任务
    try {
      const createPayload = {
        title,
        description,
        category_id: categoryId,
        task_date: taskDate ?? undefined,
      }
      const res = await todoApi.create(createPayload)
      const newTodo = convertToLocalTodo(res.data)
      setAllTodos(prev => [...prev, newTodo])
    } catch (err) {
      // axios 拦截器处理
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [])

  useEffect(() => {
    // 注册保存回调（用于编辑）
    registerSaveCallback(async (payload: TodoSavePayload) => {
      await handleSaveTodo(payload)
    })
    return () => registerSaveCallback(null)
  }, [handleSaveTodo, registerSaveCallback])

  const loadTodos = async () => {
    try {
      const res = await todoApi.getAll()
      if (res.data && res.data.length > 0) {
        const apiTodos = res.data.map(convertToLocalTodo)
        setAllTodos(apiTodos)
      } else {
        setAllTodos([])
      }
    } catch (err) {
      setAllTodos([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTodo = async (id: number) => {
    const todo = filteredTodos.find(t => t.id === id) || allTodos.find(t => t.id === id)
    if (!todo) return

    // 占位任务（id < 0）不调用 API
    if (id < 0) {
      const updated = { ...todo, completed: !todo.completed }
      // 同步到占位源：占位只存在于渲染组合，直接更新渲染列表
      if (includePlaceholders) {
        // 更新占位数组本身不可变，这里通过更新 allTodos 无法影响占位。
        // 直接更新渲染用的 allTodos 中同 id 的条目（若不存在则忽略）。
        setAllTodos(prev => prev.map(t => t.id === id ? updated : t))
      }
      return
    }

    try {
      const updated = { ...todo, completed: !todo.completed }
      const apiPayload = { is_completed: updated.completed }
      await todoApi.update(id, apiPayload)
      setAllTodos(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err) {
      // axios 拦截器处理
    }
  }

  const handlePreviewTodo = (todo: LocalTodo) => {
    setSelectedTodo(todo)
    setIsPreviewOpen(true)
  }

  const handleEditFromPreview = () => {
    if (!selectedTodo) return
    openEditModal(selectedTodo)
    setIsPreviewOpen(false)
  }

  const handleRequestDelete = (todo: LocalTodo) => {
    setTodoToDelete(todo)
    setIsConfirmOpen(true)
    setIsPreviewOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!todoToDelete) return

    // 占位任务（id < 0）不调用 API
    if (todoToDelete.id < 0) {
      // 仅移除占位显示：这里不改变真实数据源
      // 通过在占位开启的情况下过滤渲染（删除不可持久）
      // 简化处理：不在 allTodos 中删除（避免误删真实），关闭弹窗
      setIsConfirmOpen(false)
      setTodoToDelete(null)
      return
    }

    try {
      await todoApi.delete(todoToDelete.id)
      setAllTodos(allTodos.filter(t => t.id !== todoToDelete.id))
    } catch (err) {
    } finally {
      setIsConfirmOpen(false)
      setTodoToDelete(null)
    }
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setSelectedTodo(null)
  }

  return (
    <>
      {/* List */}
      {!hideContent && (
      <div className="list-container">
        {isLoading ? (
          <div className="list-loading">
            <div className="list-loading-spinner"></div>
            <p className="list-loading-text">{t.common.loading}</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="list-empty-state">
            <Coffee className="list-empty-icon" />
            <p className="list-empty-title">{emptyTitle}</p>
            <p className="list-empty-subtitle">{emptySubtitle}</p>
          </div>
        ) : (
          <div className="list-items">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="list-item group"
                onClick={() => handlePreviewTodo(todo)}
                role="button"
              >
                <div className="list-item-content">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleTodo(todo.id)
                    }}
                    className={`list-item-checkbox ${todo.completed ? 'list-item-checkbox-completed' : 'list-item-checkbox-pending'}`}
                  >
                    {todo.completed && (
                      <svg className="todo-checkbox" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="list-item-details">
                    <p className={`list-item-title ${todo.completed ? 'list-item-title-completed' : 'list-item-title-pending'}`}>
                      {todo.title}
                    </p>
                    <p className="list-item-date">{t.modal.dateLabel}：{todo.taskDate ? new Date(todo.taskDate).toLocaleDateString() : t.common.none}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRequestDelete(todo)
                    }}
                    className="list-item-action"
                  >
                    <svg className="todo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Stats */}
      {!hideStats && filteredTodos.length > 0 && (
        <div className="list-stats">
          <span>{completedCount} / {filteredTodos.length} {t.task.completedStat}</span>
        </div>
      )}

      <TodoPreviewModal
        open={isPreviewOpen}
        todo={selectedTodo}
        onClose={handleClosePreview}
        onEdit={handleEditFromPreview}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        title={t.delete.deleteConfirmTitle}
        description={t.delete.deleteConfirmDesc}
        confirmText={t.common.confirm}
        cancelText={t.common.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false)
          setTodoToDelete(null)
        }}
      />
    </>
  )
}

export default TaskList
