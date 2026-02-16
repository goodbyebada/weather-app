import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@app/providers/QueryProvider";
import { HelmetProvider } from "react-helmet-async";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import GlobalErrorBoundary from "@app/providers/GlobalErrorBoundary";
import MainPage from "@pages/main/MainPage";
import WeatherDetailPage from "@pages/weather-detail/WeatherDetailPage";
import NotFoundPage from "@pages/not-found/NotFoundPage";
import { TestPage } from "@pages/test/TestPage";
import { ToastContainer } from "@shared/ui/toast";

import { ScrollToTop } from "@shared/lib/ScrollToTop";

function App() {
  return (
    <QueryProvider>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <GlobalErrorBoundary onReset={reset}>
            <HelmetProvider>
              <ToastContainer />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route
                    path="/weather/:districtName"
                    element={<WeatherDetailPage />}
                  />
                  {import.meta.env.DEV && (
                    <Route path="/test" element={<TestPage />} />
                  )}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </HelmetProvider>
          </GlobalErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryProvider>
  );
}

export default App;
