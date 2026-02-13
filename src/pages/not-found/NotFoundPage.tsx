import { useNavigate } from "react-router-dom";
import { Button } from "@shared/ui";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <h1 className="mt-4 text-xl font-bold text-gray-800">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => navigate("/")}
        >
          홈으로 돌아가기
        </Button>
      </div>
    </main>
  );
};

export default NotFoundPage;
