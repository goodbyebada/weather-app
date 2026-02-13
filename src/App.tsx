import { QueryProvider } from "@app/providers/QueryProvider";
import { TestPage } from "@pages/test/TestPage";

function App() {
  return (
    <QueryProvider>
      <TestPage />
    </QueryProvider>
  );
}

export default App;
