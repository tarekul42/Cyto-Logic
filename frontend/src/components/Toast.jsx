import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { theme } from '../theme'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const toast = useCallback((message, type, duration) => addToast(message, type, duration), [addToast])

  const colors = {
    success: theme.color.success,
    error: theme.color.error,
    warning: theme.color.warning,
    info: theme.color.secondary,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360,
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: theme.color.panel,
              border: `1px solid ${colors[t.type] || colors.info}`,
              borderLeft: `4px solid ${colors[t.type] || colors.info}`,
              borderRadius: theme.size.radius.card,
              padding: '10px 14px',
              fontSize: theme.size.font.body,
              color: theme.color.textPrimary,
              boxShadow: theme.shadow.lift,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'toastIn 0.25s ease-out',
              cursor: 'pointer',
            }}
            onClick={() => removeToast(t.id)}
          >
            <span style={{ color: colors[t.type] || colors.info, fontWeight: 700, flexShrink: 0 }}>
              {t.type === 'success' ? '\u2713' : t.type === 'error' ? '\u2717' : t.type === 'warning' ? '\u26A0' : '\u2139'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
