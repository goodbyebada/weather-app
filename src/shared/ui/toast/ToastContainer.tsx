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

interface ToastItemProps {
  id: number;
  message: string;
  type: ToastType;
  shakeKey: number; // 애니메이션 트리거용 키
  onRemove: (id: number) => void;
}

const ToastItem = ({
  id,
  message,
  type,
  shakeKey,
  onRemove,
}: ToastItemProps) => {
  // 자동 삭제 타이머 (shakeKey가 변경될 때마다 리셋됨)
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 3000);
    return () => clearTimeout(timer);
  }, [shakeKey, id, onRemove]);

  return (
    <div
      key={`${id}-${shakeKey}`} // shakeKey가 바뀌면 컴포넌트가 재생성되어 애니메이션도 다시 실행됨
      className={`pointer-events-auto animate-[slideUp_0.3s_ease-out] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
        typeStyles[type]
      } ${shakeKey > 0 ? "animate-shake" : ""}`}
      role="status"
    >
      {message}
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState<
    (Omit<ToastItemProps, "onRemove"> & { id: number })[]
  >([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    setToasts((prev) => {
      // 중복 체크: 이미 같은 메시지가 있으면 shakeKey 업데이트
      const existingIndex = prev.findIndex(
        (t) => t.message === message && t.type === type,
      );

      if (existingIndex !== -1) {
        const newToasts = [...prev];
        newToasts[existingIndex] = {
          ...newToasts[existingIndex],
          shakeKey: Date.now(), // 타임스탬프로 강제 리렌더링 트리거
        };
        return newToasts;
      }

      const id = nextId++;
      // 새 토스트 추가 (최대 4개 유지)
      return [...prev, { id, message, type, shakeKey: 0 }].slice(-4);
    });
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

  return (
    <div
      aria-live="polite"
      aria-label="알림"
      className="pointer-events-none fixed bottom-4 left-1/2 z-toast flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
