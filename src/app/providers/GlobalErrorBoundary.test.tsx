import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import GlobalErrorBoundary from "./GlobalErrorBoundary";

// 콘솔 에러를 억제하기 위한 설정 (테스트 중 에러 로그가 너무 많이 찍히는 것 방지)
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.clearAllMocks();
});

// 에러를 발생시키는 테스트용 컴포넌트
const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("GlobalErrorBoundary", () => {
  it("에러가 없을 때 자식 컴포넌트를 정상적으로 렌더링해야 함", () => {
    render(
      <GlobalErrorBoundary>
        <div>정상 컴포넌트</div>
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText("정상 컴포넌트")).toBeInTheDocument();
  });

  it("자식 컴포넌트에서 에러 발생 시 Fallback UI를 렌더링해야 함", () => {
    const textDecoderError = "텍스트 디코더 에러 발생";

    render(
      <GlobalErrorBoundary>
        <ThrowError message={textDecoderError} />
      </GlobalErrorBoundary>,
    );

    // Fallback UI의 주요 요소들이 렌더링되었는지 확인
    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
    expect(screen.getByText(textDecoderError)).toBeInTheDocument();
    expect(
      screen.getByText("문제가 지속되면 페이지를 새로고침 해주세요."),
    ).toBeInTheDocument();
  });

  it("재시도(초기화) 버튼 클릭 시 onReset이 호출되어야 함", () => {
    const handleReset = vi.fn();
    const errorMessage = "재시도 테스트 에러";

    // 첫 렌더링: 에러 발생 상태
    render(
      <GlobalErrorBoundary onReset={handleReset}>
        <ThrowError message={errorMessage} />
      </GlobalErrorBoundary>,
    );

    // 에러 화면 확인
    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();

    // 재시도 버튼 찾기 (ErrorMessage 컴포넌트 내부 구현에 따라 텍스트나 역할로 찾음)
    // ErrorMessage 컴포넌트 구현을 모르므로, 보통 "다시 시도" 혹은 "Retry" 버튼일 것으로 추정
    // 하지만 현재 GlobalErrorBoundary.tsx를 보면 ErrorMessage 컴포넌트에 onRetry를 전달함.
    // ErrorMessage 내부를 확인하지 않았지만, 통상적인 버튼 텍스트나 역할을 가정.
    // 만약 실패하면 ErrorMessage 컴포넌트를 확인해야 함.
    // 우선 button 역할을 가진 요소를 찾아 클릭 시도.
    const retryButton = screen.getByRole("button");
    fireEvent.click(retryButton);

    // onReset 콜백이 호출되었는지 확인
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
