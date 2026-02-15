import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentWeather, fetchForecast } from "@shared/api/weather.api";
import { parseApiError } from "@shared/api/error";
import { SearchBar } from "@widgets/search-bar";
import { toast } from "@shared/ui/toast";

// 서울 기본 좌표
const DEFAULT_LAT = 37.5683;
const DEFAULT_LON = 126.9778;

export const TestPage = () => {
  const { lat: paramLat, lon: paramLon } = useParams();

  const initialLat = paramLat ? Number(paramLat) : DEFAULT_LAT;
  const initialLon = paramLon ? Number(paramLon) : DEFAULT_LON;

  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [queryCoords, setQueryCoords] = useState({
    lat: initialLat,
    lon: initialLon,
  });

  // URL 파라미터가 변경되면 해당 좌표로 업데이트 (초기 렌더링 이후)
  useEffect(() => {
    if (paramLat && paramLon) {
      const nLat = Number(paramLat);
      const nLon = Number(paramLon);

      setLat((prev) => (prev !== nLat ? nLat : prev));
      setLon((prev) => (prev !== nLon ? nLon : prev));
      setQueryCoords((prev) =>
        prev.lat !== nLat || prev.lon !== nLon
          ? { lat: nLat, lon: nLon }
          : prev,
      );
    }
  }, [paramLat, paramLon]);

  const weatherQuery = useQuery({
    queryKey: ["weather", queryCoords.lat, queryCoords.lon],
    queryFn: () => fetchCurrentWeather(queryCoords.lat, queryCoords.lon),
  });

  const forecastQuery = useQuery({
    queryKey: ["forecast", queryCoords.lat, queryCoords.lon],
    queryFn: () => fetchForecast(queryCoords.lat, queryCoords.lon),
  });

  const handleSearch = () => {
    setQueryCoords({ lat, lon });
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>API Test Page</h1>

      <div
        style={{
          marginBottom: 40,
          background: "#f8f9fa",
          padding: 20,
          borderRadius: 16,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Location Search (Widget Test)</h2>
        <SearchBar />
      </div>

      <div
        style={{
          marginBottom: 40,
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Toast Test</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => toast.success("성공 알림입니다!")}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Success
          </button>
          <button
            onClick={() => toast.error("에러 알림입니다!")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Error
          </button>
          <button
            onClick={() => toast.info("중복 알림 테스트")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            중복 테스트 (연타)
          </button>
          <button
            onClick={() => {
              for (let i = 1; i <= 6; i++) {
                setTimeout(() => {
                  toast.info(`${i}번째 알림`);
                }, i * 100);
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            6개 연속 (Limit 4 확인)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>
          위도:{" "}
          <input
            type="number"
            step="0.01"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          경도:{" "}
          <input
            type="number"
            step="0.01"
            value={lon}
            onChange={(e) => setLon(Number(e.target.value))}
          />
        </label>
        <button onClick={handleSearch} style={{ marginLeft: 10 }}>
          조회
        </button>
      </div>

      <h2>Current Weather</h2>
      {weatherQuery.isLoading && <p>로딩 중...</p>}
      {weatherQuery.isError && (
        <p style={{ color: "red" }}>
          {parseApiError(weatherQuery.error).message}
        </p>
      )}
      {weatherQuery.data && (
        <pre
          style={{
            background: "white",
            padding: 10,
            overflow: "auto",
            maxHeight: 400,
          }}
        >
          {JSON.stringify(weatherQuery.data, null, 2)}
        </pre>
      )}

      <h2>5-Day Forecast (첫 5개)</h2>
      {forecastQuery.isLoading && <p>로딩 중...</p>}
      {forecastQuery.isError && (
        <p style={{ color: "red" }}>
          {parseApiError(forecastQuery.error).message}
        </p>
      )}
      {forecastQuery.data && (
        <pre
          style={{
            background: "white",
            padding: 10,
            overflow: "auto",
            maxHeight: 400,
          }}
        >
          {JSON.stringify(forecastQuery.data.list.slice(0, 5), null, 2)}
        </pre>
      )}
    </div>
  );
};
