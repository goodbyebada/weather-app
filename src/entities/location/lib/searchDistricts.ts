import type {
  District,
  LocationSearchResult,
} from "@shared/types/location.types";
import rawDistricts from "../data/korea_districts.json";

// "서울특별시-종로구-청운동" 형태의 문자열을 District 객체로 파싱
const parseDistrict = (raw: string): District => {
  const parts = raw.split("-");
  return {
    full: raw,
    city: parts[0],
    district: parts[1],
    dong: parts[2],
  };
};

// 파싱된 전체 지역 목록 (앱 시작 시 1회 파싱)
const allDistricts: District[] = (rawDistricts as string[]).map(parseDistrict);

// 한글 초성 테이블
const CHOSUNG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

// 한글 문자에서 초성 추출
const getChosung = (char: string): string => {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return char;
  return CHOSUNG[Math.floor((code - 0xac00) / 588)];
};

/**
 * 한글 포함 여부 확인 (초성 및 혼합 검색 지원)
 * @param target 대상 문자열 (예: "광주광역시")
 * @param query 검색어 (예: "광ㅈ", "ㅈㄹ")
 * @returns 매칭 성공 시 시작 인덱스, 실패 시 -1
 */
export const koreanIncludes = (target: string, query: string): number => {
  const normalizedTarget = target.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  for (let i = 0; i <= normalizedTarget.length - normalizedQuery.length; i++) {
    let match = true;
    for (let j = 0; j < normalizedQuery.length; j++) {
      const targetChar = normalizedTarget[i + j];
      const queryChar = normalizedQuery[j];

      // 검색어 문자가 초성인 경우
      if (CHOSUNG.includes(queryChar)) {
        if (getChosung(targetChar) !== queryChar) {
          match = false;
          break;
        }
      }
      // 검색어 문자가 완성형인 경우
      else {
        if (targetChar !== queryChar) {
          match = false;
          break;
        }
      }
    }
    if (match) return i;
  }

  return -1;
};

// District의 각 계층에서 매칭 확인
const matchDistrict = (
  district: District,
  query: string,
): LocationSearchResult | null => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;

  // 시 → 구 → 동 순서로 매칭 (광역 자치단체 우선)
  const cityIndex = koreanIncludes(district.city, normalizedQuery);
  if (cityIndex !== -1) {
    return { district, matchType: "city" };
  }
  if (district.district) {
    const index = koreanIncludes(district.district, normalizedQuery);
    if (index !== -1) return { district, matchType: "district" };
  }
  if (district.dong) {
    const index = koreanIncludes(district.dong, normalizedQuery);
    if (index !== -1) return { district, matchType: "dong" };
  }

  return null;
};

// 검색 결과 정렬: matchType 우선순위 (city > district > dong), 같은 타입이면 이름순
const MATCH_PRIORITY: Record<LocationSearchResult["matchType"], number> = {
  city: 0,
  district: 1,
  dong: 2,
};

const sortResults = (
  results: LocationSearchResult[],
): LocationSearchResult[] => {
  return results.sort((a, b) => {
    const priorityDiff =
      MATCH_PRIORITY[a.matchType] - MATCH_PRIORITY[b.matchType];
    if (priorityDiff !== 0) return priorityDiff;
    return a.district.full.localeCompare(b.district.full, "ko");
  });
};

// 중복 제거: 같은 full 이름은 가장 구체적인 matchType만 유지
const deduplicateResults = (
  results: LocationSearchResult[],
): LocationSearchResult[] => {
  const seen = new Map<string, LocationSearchResult>();
  for (const result of results) {
    const key = result.district.full;
    const existing = seen.get(key);
    if (
      !existing ||
      MATCH_PRIORITY[result.matchType] < MATCH_PRIORITY[existing.matchType]
    ) {
      seen.set(key, result);
    }
  }
  return [...seen.values()];
};

export interface SearchOptions {
  maxResults?: number;
}

/**
 * 지역 검색 함수
 * - 일반 텍스트 검색 및 초성 검색(ㅅㅇ → 서울), 혼합 검색(광ㅈ → 광주) 지원
 * - 계층적 매칭 (시 > 구 > 동)
 * - 결과는 구체적인 매칭 우선 정렬
 */
export const searchDistricts = (
  query: string,
  options: SearchOptions = {},
): LocationSearchResult[] => {
  const { maxResults = 20 } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: LocationSearchResult[] = [];
  for (const district of allDistricts) {
    const result = matchDistrict(district, trimmed);
    if (result) results.push(result);
  }

  const deduplicated = deduplicateResults(results);
  const sorted = sortResults(deduplicated);

  return sorted.slice(0, maxResults);
};

export { allDistricts, parseDistrict, getChosung, CHOSUNG };
