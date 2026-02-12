import { useState, useEffect, useCallback } from "react";
import { type ToastType, setAddToastFn } from "./toast-manager";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-success text-white",
  error: "bg-error text-white",
  info: "bg-gray-800 text-white",
};

let nextId = 0;

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    setAddToastFn(addToast);
    return () => {
      setAddToastFn(null);
    };
  }, [addToast]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => removeToast(latest.id), 3000);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  return (
    <div
      aria-live="polite"
      aria-label="알림"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-[slideUp_0.3s_ease-out] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${typeStyles[t.type]}`}
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
