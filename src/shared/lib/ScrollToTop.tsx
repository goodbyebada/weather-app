import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // navigate 등으로 이동 시 state에 { preventScrollReset: true }를 전달하면 스크롤 유지
    if (state?.preventScrollReset) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, state]);

  return null;
};
