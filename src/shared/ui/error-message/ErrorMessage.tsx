interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-error/20 bg-error/5 p-4 text-center"
    >
      <p className="text-sm font-medium text-error">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg bg-error px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-error/90"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
