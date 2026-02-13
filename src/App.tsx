import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "@app/providers/QueryProvider";
import { TestPage } from "@pages/test/TestPage";

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/weather/:lat/:lon" element={<TestPage />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;

