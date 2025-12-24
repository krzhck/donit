import { createContext, useContext, useState, useCallback } from 'react'

interface TodoModalContextType {
  isTodoModalOpen: boolean
  editingTodo: { id: number; title: string; completed: boolean; dueDate?: string } | null
  openCreateModal: () => void
  openEditModal: (todo: { id: number; title: string; completed: boolean; dueDate?: string }) => void
  closeModal: () => void
  setSaveCallback: (callback: (payload: { title: string; dueDate?: string }) => Promise<void>) => void
}

const TodoModalContext = createContext<TodoModalContextType | undefined>(undefined)

export function TodoModalProvider({ children }: { children: React.ReactNode }) {
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<TodoModalContextType['editingTodo']>(null)

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

  const setSaveCallback = useCallback(() => {
    // pages/Inbox 在 window.dispatchEvent('save-todo') 时直接使用
  }, [])

  return (
    <TodoModalContext.Provider
      value={{
        isTodoModalOpen,
        editingTodo,
        openCreateModal,
        openEditModal,
        closeModal,
        setSaveCallback,
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
