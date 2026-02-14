import {
  getChoseong,
  canBeChoseong,
  hasBatchim,
  disassembleCompleteCharacter,
} from "es-hangul";
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
    li: parts[3],
  };
};

// 파싱된 전체 지역 목록 (앱 시작 시 1회 파싱)
const allDistricts: District[] = (rawDistricts as string[]).map(parseDistrict);

/**
 * 한글 포함 여부 확인 (초성 및 혼합 검색 지원)
 * es-hangul의 getChoseong, canBeChoseong을 래핑하여 매칭 시작 인덱스를 반환
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

      if (canBeChoseong(queryChar)) {
        // 검색어 문자가 초성인 경우: 대상 문자의 초성과 비교
        if (getChoseong(targetChar) !== queryChar) {
          match = false;
          break;
        }
      } else if (
        j === normalizedQuery.length - 1 &&
        !hasBatchim(queryChar) &&
        disassembleCompleteCharacter(queryChar) != null
      ) {
        // 마지막 글자가 받침 없는 한글인 경우: 초성+중성만 비교 ("강나" → "강남")
        const qd = disassembleCompleteCharacter(queryChar);
        const td = disassembleCompleteCharacter(targetChar);
        if (
          !qd ||
          !td ||
          qd.choseong !== td.choseong ||
          qd.jungseong !== td.jungseong
        ) {
          match = false;
          break;
        }
      } else if (targetChar !== queryChar) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }

  return -1;
};

// 매칭 필드 정의
const FIELDS: {
  key: keyof District;
  type: LocationSearchResult["matchType"];
}[] = [
  { key: "city", type: "city" },
  { key: "district", type: "district" },
  { key: "dong", type: "dong" },
  { key: "li", type: "li" },
];

// District의 각 계층에서 매칭 확인
const matchDistrict = (
  district: District,
  query: string,
): LocationSearchResult | null => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return null;

  const tokens = normalizedQuery.split(/\s+/);

  if (tokens.length > 1) {
    // 복합 쿼리: 모든 토큰이 각각 어딘가 필드에 매칭되어야 함
    const fields = FIELDS.map((f) => district[f.key]).filter(
      Boolean,
    ) as string[];
    const allMatched = tokens.every((token) =>
      fields.some((field) => koreanIncludes(field, token) !== -1),
    );
    if (!allMatched) return null;

    // 가장 구체적인(마지막) 매칭 필드의 matchType 반환
    let lastMatchType: LocationSearchResult["matchType"] = "city";
    for (const { key, type } of FIELDS) {
      const value = district[key];
      if (
        value &&
        tokens.some((token) => koreanIncludes(value, token) !== -1)
      ) {
        lastMatchType = type;
      }
    }
    return { district, matchType: lastMatchType };
  }

  // 단일 토큰: 시 → 구 → 동 → 리 순서로 매칭
  for (const { key, type } of FIELDS) {
    const value = district[key];
    if (value && koreanIncludes(value, normalizedQuery) !== -1) {
      return { district, matchType: type };
    }
  }

  return null;
};

// 검색 결과 정렬: matchType 우선순위 (city > district > dong > li), 같은 타입이면 이름순
const MATCH_PRIORITY: Record<LocationSearchResult["matchType"], number> = {
  city: 0,
  district: 1,
  dong: 2,
  li: 3,
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
 * - 복합 쿼리 지원 ("경기도 군포시" → 공백으로 분리된 다중 토큰 검색)
 * - 계층적 매칭 (시 > 구 > 동 > 리)
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

export { allDistricts, parseDistrict };
