type ToastType = "success" | "error" | "info";

export type { ToastType };

export let addToastFn:
  | ((message: string, type?: ToastType) => void)
  | null = null;

export const setAddToastFn = (
  fn: ((message: string, type?: ToastType) => void) | null,
) => {
  addToastFn = fn;
};

export const toast = {
  success: (message: string) => addToastFn?.(message, "success"),
  error: (message: string) => addToastFn?.(message, "error"),
  info: (message: string) => addToastFn?.(message, "info"),
};
