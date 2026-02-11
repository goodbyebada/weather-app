import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCurrentWeather,
  fetchForecast,
} from "@shared/api/weather.api";
import { parseApiError } from "@shared/api/error";

// 서울 기본 좌표
const DEFAULT_LAT = 37.5683;
const DEFAULT_LON = 126.9778;

export const TestPage = () => {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [queryCoords, setQueryCoords] = useState({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
  });

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
            background: "#000000",
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
            background: "#000000",
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
