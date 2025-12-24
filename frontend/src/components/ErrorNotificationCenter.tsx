import { useState, useEffect } from 'react'

interface ErrorNotification {
  id: string
  message: string
  details?: string
  type: 'error' | 'warning' | 'info'
}

export function ErrorNotificationCenter() {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([])

  useEffect(() => {
    const handleShowError = (event: CustomEvent) => {
      const { message, details, type = 'error' } = event.detail
      const id = Date.now().toString()
      const notification: ErrorNotification = { id, message, details, type }
      
      setNotifications(prev => [...prev, notification])
      console.error(`[${type.toUpperCase()}]`, message, details)
      
      // 自动关闭
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, 15000)
    }

    window.addEventListener('show-error', handleShowError as EventListener)
    return () => window.removeEventListener('show-error', handleShowError as EventListener)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification-item ${
            notification.type === 'error'
              ? 'notification-item-error'
              : notification.type === 'warning'
              ? 'notification-item-warning'
              : 'notification-item-info'
          }`}
        >
          <div className="notification-content">
            <div className="notification-text">
              <p className="notification-title">{notification.message}</p>
              {notification.details && (
                <p className="notification-details">
                  {notification.details}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="notification-close-button"
            >
              <svg className="notification-close-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function showErrorNotification(message: string, details?: string) {
  window.dispatchEvent(new CustomEvent('show-error', {
    detail: { message, details, type: 'error' }
  }))
}

export function showWarningNotification(message: string, details?: string) {
  window.dispatchEvent(new CustomEvent('show-error', {
    detail: { message, details, type: 'warning' }
  }))
}

export function showInfoNotification(message: string, details?: string) {
  window.dispatchEvent(new CustomEvent('show-error', {
    detail: { message, details, type: 'info' }
  }))
}
