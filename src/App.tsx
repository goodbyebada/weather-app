import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@app/providers/QueryProvider";
import MainPage from "@pages/main/MainPage";
import WeatherDetailPage from "@pages/weather-detail/WeatherDetailPage";
import { TestPage } from "@pages/test/TestPage";

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/weather/:lat/:lon" element={<WeatherDetailPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
