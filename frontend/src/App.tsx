import { NavLink, Outlet } from 'react-router-dom'
import { CreateTodoModal } from './components/CreateTodoModal'
import { ErrorNotificationCenter } from './components/ErrorNotificationCenter'
import { useTodoModal } from './contexts/TodoModalContext'
import { t } from './locales'

function AppContent() {
  const { isTodoModalOpen, editingTodo, closeModal, openCreateModal } = useTodoModal()

  const openCreateTodo = () => {
    openCreateModal()
  }

  const handleSaveTodo = async (payload: { title: string; dueDate?: string }) => {
    // 触发全局保存事件，由 Inbox 或其他页面处理
    const mode = editingTodo ? 'edit' : 'create'
    window.dispatchEvent(new CustomEvent('save-todo', { detail: { ...payload, id: editingTodo?.id, mode } }))
    closeModal()
  }

  return (
    <>
      <div className="app-container">
        <div className="app-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="sidebar-title">Donit</span>
            </div>
            <nav className="sidebar-nav">
              <NavLink to="/app/inbox" className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }>📥 {t.sidebar.inbox}</NavLink>
              <NavLink to="/app/today" className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }>🗓️ {t.sidebar.today}</NavLink>
              <NavLink to="/app/lists" className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }># {t.sidebar.lists}</NavLink>
              <NavLink to="/app/profile" className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }>👤 {t.sidebar.profile}</NavLink>
            </nav>

            <div className="sidebar-button-container">
              <button
                type="button"
                onClick={openCreateTodo}
                className="btn btn-primary"
              >
                <span className="btn-icon">＋</span>
                <span className="btn-text">{t.sidebar.newTask}</span>
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="main-content">
            <div className="main-content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Create Todo Modal */}
      <CreateTodoModal
        open={isTodoModalOpen}
        initialTitle={editingTodo?.title}
        initialDueDate={editingTodo?.dueDate}
        mode={editingTodo ? 'edit' : 'create'}
        onSave={handleSaveTodo}
        onCancel={closeModal}
      />

      {/* Global Error Notification Center */}
      <ErrorNotificationCenter />
    </>
  )
}

export default function App() {
  return <AppContent />
}
