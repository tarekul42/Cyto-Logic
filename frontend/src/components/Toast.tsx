import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { theme } from '../theme'

interface ToastItem {
  id: number
  message: string
  type: string
}

type ToastFn = (message: string, type?: string, duration?: number) => number | undefined

const ToastContext = createContext<ToastFn | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const addToast = useCallback((message: string, type = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, duration)
    return id
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const toast = useCallback((message: string, type?: string, duration?: number) => addToast(message, type, duration), [addToast])

  const colors: Record<string, string> = {
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

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
