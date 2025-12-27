import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { User, CircleCheckBig, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { CreateTodoModal } from './components/CreateTodoModal'
import { ErrorNotificationCenter } from './components/ErrorNotificationCenter'
import { useTodoModal } from './contexts/TodoModalContext'
import { t } from './locales'
import { setApiErrorHandler } from './api/Client'
import { showErrorNotification } from './components/ErrorNotificationCenter'
import { useEffect, useState } from 'react'

function AppContent() {
  const navigate = useNavigate()
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const { isTodoModalOpen, editingTodo, closeModal, openCreateModal, saveTodo } = useTodoModal()

  useEffect(() => {
    setApiErrorHandler(({ status, message, details }) => {
      showErrorNotification(`${t.errors.backendError}: ${status} ${message}`, details)
    })
    return () => setApiErrorHandler(null)
  }, [])

  const openCreateTodo = () => {
    openCreateModal()
  }

  const handleSaveTodo = async (payload: { title: string; description?: string; taskDate?: string | null; categoryId?: number }) => {
    const mode = editingTodo ? 'edit' : 'create'
    await saveTodo({ ...payload, id: editingTodo?.id, mode })
    closeModal()
  }

  const handleProfileClick = () => {
    navigate('/app/profile')
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <>
      <div className="app-container">
        <div className="app-wrapper">
          {/* Sidebar */}
          <aside className={`sidebar ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
            <div className="sidebar-header-wrapper">
              <div className="sidebar-header">
                <div className="sidebar-logo">
                  <CircleCheckBig size={28} className="text-red-500" fill="white" />
                </div>
                <span className="sidebar-title">Donit</span>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-toggle-btn"
                title="Toggle sidebar"
              >
                <PanelLeftClose size={20} className="text-gray-600" />
              </button>
            </div>
            
            <div className="sidebar-button-container">
              <button
                type="button"
                onClick={openCreateTodo}
                className="btn btn-new-task"
              >
                <span className="btn-icon">＋</span>
                <span className="btn-text">{t.sidebar.newTask}</span>
              </button>
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
              }>🏷️ {t.sidebar.lists}</NavLink>
            </nav>

            <div className="sidebar-footer">
              <button
                type="button"
                onClick={handleProfileClick}
                className="profile-avatar-btn"
                title={t.sidebar.profile}
              >
                <User size={24} className="text-gray-600" />
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="main-content">
            {!sidebarVisible && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-expand-btn"
                title="Open sidebar"
              >
                <PanelLeftOpen size={20} className="text-gray-600" />
              </button>
            )}
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
        initialDescription={editingTodo?.description}
        initialTaskDate={editingTodo?.taskDate}
        initialCategoryId={editingTodo?.categoryId}
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
