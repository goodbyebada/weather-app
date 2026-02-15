import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@app/providers/QueryProvider";
import MainPage from "@pages/main/MainPage";
import WeatherDetailPage from "@pages/weather-detail/WeatherDetailPage";
import NotFoundPage from "@pages/not-found/NotFoundPage";
import { TestPage } from "@pages/test/TestPage";
import { ToastContainer } from "@shared/ui/toast";

import { ScrollToTop } from "@shared/lib/ScrollToTop";

function App() {
  return (
    <QueryProvider>
      <ToastContainer />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/weather/:districtName"
            element={<WeatherDetailPage />}
          />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
