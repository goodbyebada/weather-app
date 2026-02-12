// 파싱된 지역 정보 (korea_districts.json의 "시-구-동" 문자열을 파싱)
export interface District {
  full: string; // "서울특별시-종로구-청운동"
  city: string; // "서울특별시"
  district?: string; // "종로구"
  dong?: string; // "청운동"
}

// 좌표 정보
export interface Coordinates {
  lat: number;
  lon: number;
}

// 검색 결과 항목
export interface LocationSearchResult {
  district: District;
  matchType: "city" | "district" | "dong";
}
