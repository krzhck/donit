import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title?: string
  children: ReactNode
  footer?: ReactNode
  onClose?: () => void
  widthClass?: string
}

export function Modal({ open, title, children, footer, onClose, widthClass }: ModalProps) {
  useEffect(() => {
    if (!open || !onClose) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-overlay" onClick={onClose} />
      <div className={`modal-content ${widthClass ?? 'max-w-md'}`}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
