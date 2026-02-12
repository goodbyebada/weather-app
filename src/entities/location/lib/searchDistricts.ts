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

// 문자열의 초성만 추출
const extractChosung = (str: string): string => {
  return [...str].map(getChosung).join("");
};

// 검색어가 초성으로만 이루어져 있는지 판별
const isChosungOnly = (query: string): boolean => {
  return [...query].every((ch) => CHOSUNG.includes(ch));
};

// 초성 매칭: 검색어의 각 초성이 대상 문자열의 초성과 순서대로 매칭되는지
const matchChosung = (target: string, query: string): boolean => {
  const targetChosung = extractChosung(target);
  return targetChosung.includes(query);
};

// District의 각 계층에서 매칭 확인
const matchDistrict = (
  district: District,
  query: string,
  useChosung: boolean,
): LocationSearchResult | null => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;

  const match = (target: string): boolean => {
    if (useChosung) return matchChosung(target, normalizedQuery);
    return target.toLowerCase().includes(normalizedQuery);
  };

  // 동 → 구 → 시 순서로 매칭 (가장 구체적인 것 우선)
  if (district.dong && match(district.dong)) {
    return { district, matchType: "dong" };
  }
  if (district.district && match(district.district)) {
    return { district, matchType: "district" };
  }
  if (match(district.city)) {
    return { district, matchType: "city" };
  }

  return null;
};

// 검색 결과 정렬: matchType 우선순위 (dong > district > city), 같은 타입이면 이름순
const MATCH_PRIORITY: Record<LocationSearchResult["matchType"], number> = {
  dong: 0,
  district: 1,
  city: 2,
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
 * - 일반 텍스트 검색 및 초성 검색(ㅅㅇ → 서울) 지원
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

  const useChosung = isChosungOnly(trimmed);

  const results: LocationSearchResult[] = [];
  for (const district of allDistricts) {
    const result = matchDistrict(district, trimmed, useChosung);
    if (result) results.push(result);
  }

  const deduplicated = deduplicateResults(results);
  const sorted = sortResults(deduplicated);

  return sorted.slice(0, maxResults);
};

export { allDistricts, parseDistrict };
