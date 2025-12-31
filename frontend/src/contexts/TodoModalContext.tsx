import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { todoApi } from '../api/Client'

export type TodoSavePayload = {
  id?: number
  title: string
  description?: string
  taskDate?: string | null
  categoryId?: number
  mode: 'create' | 'edit'
}

interface TodoModalContextType {
  isTodoModalOpen: boolean
  editingTodo: { id: number; title: string; description?: string; completed: boolean; taskDate?: string; category?: string; categoryId?: number } | null
  openCreateModal: () => void
  openEditModal: (todo: { id: number; title: string; description?: string; completed: boolean; taskDate?: string; category?: string; categoryId?: number }) => void
  closeModal: () => void
  registerSaveCallback: (callback: ((payload: TodoSavePayload) => Promise<void>) | null) => void
  saveTodo: (payload: TodoSavePayload) => Promise<void>
}

const TodoModalContext = createContext<TodoModalContextType | undefined>(undefined)

export function TodoModalProvider({ children }: { children: ReactNode }) {
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoModalContextType['editingTodo']>(null)
  const [saveCallback, setSaveCallback] = useState<((payload: TodoSavePayload) => Promise<void>) | null>(null)

  const openCreateModal = useCallback(() => {
    setEditingTodo(null)
    setIsTodoModalOpen(true)
  }, [])

  const openEditModal = useCallback((todo: TodoModalContextType['editingTodo']) => {
    setEditingTodo(todo)
    setIsTodoModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsTodoModalOpen(false)
    setEditingTodo(null)
  }, [])

  const registerSaveCallback = useCallback((callback: ((payload: TodoSavePayload) => Promise<void>) | null) => {
    setSaveCallback(() => callback)
  }, [])

  const saveTodo = useCallback(async (payload: TodoSavePayload) => {
    if (saveCallback) {
      await saveCallback(payload)
      return
    }

    // Fallback: when no TaskList is mounted (e.g., Profile page or collapsed Lists), still persist to backend
    const { id, title, description, taskDate, categoryId, mode } = payload
    try {
      if (mode === 'edit' && typeof id === 'number') {
        await todoApi.update(id, {
          title,
          description,
          category_id: categoryId,
          task_date: taskDate ?? undefined,
        })
      } else {
        await todoApi.create({
          title,
          description,
          category_id: categoryId,
          task_date: taskDate ?? undefined,
        })
      }
    } catch (err) {
      // Errors are handled by axios interceptor
    }
  }, [saveCallback])

  return (
    <TodoModalContext.Provider
      value={{
        isTodoModalOpen,
        editingTodo,
        openCreateModal,
        openEditModal,
        closeModal,
        registerSaveCallback,
        saveTodo,
      }}
    >
      {children}
    </TodoModalContext.Provider>
  )
}

export function useTodoModal() {
  const context = useContext(TodoModalContext)
  if (!context) {
    throw new Error('useTodoModal must be used within TodoModalProvider')
  }
  return context
}
