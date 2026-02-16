import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { ErrorMessage } from "@shared/ui";
import type { ReactNode } from "react";

const GlobalErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          오류가 발생했습니다
        </h1>
        <ErrorMessage
          message={
            (error as Error).message || "알 수 없는 오류가 발생했습니다."
          }
          onRetry={resetErrorBoundary}
        />
        <p className="mt-4 text-center text-sm text-gray-500">
          문제가 지속되면 페이지를 새로고침 해주세요.
        </p>
      </div>
    </div>
  );
};

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

const GlobalErrorBoundary = ({
  children,
  onReset,
}: GlobalErrorBoundaryProps) => {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onReset={onReset}>
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;
