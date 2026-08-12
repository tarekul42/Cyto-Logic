import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { ICON } from "../constants";

type ToastType = "success" | "error" | "warning" | "info";

const TOAST_ICON: Record<ToastType, string> = {
  success: ICON.CHECK,
  error: ICON.CROSS,
  warning: ICON.WARNING,
  info: ICON.INFO,
};

const TOAST_VAR: Record<ToastType, string> = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  warning: "var(--color-warning)",
  info: "var(--color-secondary)",
};

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type ToastFn = (
  message: string,
  type?: ToastType,
  duration?: number,
) => number | undefined;

const ToastContext = createContext<ToastFn | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      for (const id of Object.keys(timers.current)) {
        clearTimeout(timers.current[Number(id)]);
      }
      timers.current = {};
    };
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000): number => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        delete timers.current[id];
      }, duration);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (
      message: string,
      type?: ToastType,
      duration?: number,
    ): number | undefined => addToast(message, type, duration),
    [addToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-[360px]">
        {toasts.map((t) => {
          const accent = TOAST_VAR[t.type];
          return (
            <div
              key={t.id}
              className="bg-panel rounded-lg px-3.5 py-2.5 text-[13px] text-text-primary shadow-lift flex items-center gap-2.5 cursor-pointer"
              style={{
                border: `1px solid ${accent}`,
                borderLeft: `4px solid ${accent}`,
              }}
              onClick={() => removeToast(t.id)}
            >
              <span
                className="font-bold flex-shrink-0"
                style={{ color: accent }}
              >
                {TOAST_ICON[t.type]}
              </span>
              <span className="flex-1">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
