import axios from "axios";
import type { Coordinates } from "@shared/types/location.types";

const API_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const GEOCODING_URL = "https://dapi.kakao.com/v2/local/search/address.json";

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
        analyze_type: 'similar',
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
