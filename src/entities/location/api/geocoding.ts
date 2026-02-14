import axios from "axios";
import type { Coordinates } from "@shared/types/location.types";

const API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const GEOCODING_URL = "https://dapi.kakao.com/v2/local/search/address.json";
const REVERSE_GEOCODING_URL =
  "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json";

interface KakaoAddressDocument {
  address_name: string;
  y: string;
  x: string;
  address_type: string;
  x_coor: string;
  y_coor: string;
}

interface KakaoGeocodingResponse {
  documents: KakaoAddressDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

/**
 * 주소(지역명) → 좌표 변환
 * Kakao Local API (주소 검색) 사용
 */
export const fetchCoordinates = async (
  query: string,
): Promise<Coordinates | null> => {
  const searchAddress = query.trim().split(/\s+/).pop() || "";

  if (!searchAddress) return null;

  try {
    const { data } = await axios.get<KakaoGeocodingResponse>(GEOCODING_URL, {
      headers: {
        Authorization: `KakaoAK ${API_KEY}`,
      },
      params: {
        query: searchAddress,
        analyze_type: "similar",
        page: 1,
        size: 1,
      },
    });

    if (data.documents.length === 0) return null;

    const { x, y } = data.documents[0];

    return {
      lat: parseFloat(y),
      lon: parseFloat(x),
    };
  } catch (error) {
    console.error("Geocoding fetch error:", error);
    return null;
  }
};

interface KakaoRegionDocument {
  region_type: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

interface KakaoRegionResponse {
  documents: KakaoRegionDocument[];
}

/**
 * 좌표 → 행정구역명 변환 (역지오코딩)
 * Kakao Local API (좌표 → 행정구역정보) 사용
 * 반환 형식: "서울특별시-종로구-청운효자동" (korea_districts.json과 동일한 형식)
 */
export const fetchReverseGeocode = async (
  lat: number,
  lon: number,
): Promise<string | null> => {
  try {
    const { data } = await axios.get<KakaoRegionResponse>(
      REVERSE_GEOCODING_URL,
      {
        headers: {
          Authorization: `KakaoAK ${API_KEY}`,
        },
        params: {
          x: lon,
          y: lat,
        },
      },
    );

    const region = data.documents.find((doc) => doc.region_type === "H");
    if (!region) return null;

    const parts = [
      region.region_1depth_name,
      region.region_2depth_name,
      region.region_3depth_name,
    ].filter(Boolean);

    return parts.join("-");
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};
