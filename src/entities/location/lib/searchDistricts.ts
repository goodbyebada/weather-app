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

// 파싱된 전체 지역 목록 (최초 호출 시 1회 로드 후 캐싱)
let allDistricts: District[] | null = null;

const loadDistricts = async (): Promise<District[]> => {
  if (allDistricts) return allDistricts;
  try {
    const response = await fetch("/data/korea_districts.json");
    if (!response.ok) {
      throw new Error("Failed to load districts data");
    }
    const rawDistricts = (await response.json()) as string[];
    allDistricts = rawDistricts.map(parseDistrict);
    return allDistricts;
  } catch {
    return [];
  }
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

      if (canBeChoseong(queryChar)) {
        if (getChoseong(targetChar) !== queryChar) {
          match = false;
          break;
        }
      } else if (
        j === normalizedQuery.length - 1 &&
        !hasBatchim(queryChar) &&
        disassembleCompleteCharacter(queryChar) != null
      ) {
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

/**
 * 엄격한 한글 포함 여부 확인 (부분 음절 매칭 제외)
 * 초성 매칭과 정확 일치만 허용, 마지막 글자 부분 음절 비교 없음
 */
const koreanIncludesExact = (target: string, query: string): number => {
  const normalizedTarget = target.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  for (let i = 0; i <= normalizedTarget.length - normalizedQuery.length; i++) {
    let match = true;
    for (let j = 0; j < normalizedQuery.length; j++) {
      const targetChar = normalizedTarget[i + j];
      const queryChar = normalizedQuery[j];

      if (canBeChoseong(queryChar)) {
        if (getChoseong(targetChar) !== queryChar) {
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

  const tokens = normalizedQuery.split(/[^\w가-힣]+/);

  if (tokens.length > 1) {
    // 복합 쿼리: 모든 토큰이 각각 어딘가 필드(또는 연결 문자열)에 매칭되어야 함

    const fields = FIELDS.map((f) => district[f.key]).filter(
      Boolean,
    ) as string[];
    const concatenated = fields.join("");

    // token -> 검색어(query)
    const allMatched = tokens.every(
      (token) =>
        fields.some((field) => koreanIncludes(field, token) !== -1) ||
        koreanIncludes(concatenated, token) !== -1,
    );
    if (!allMatched) return null;

    // 가장 구체적인(마지막) 매칭 필드의 matchType 반환
    let lastMatchType: LocationSearchResult["matchType"] = "city";
    let minMatchIndex = 999;

    // FIELDS 순서대로(시 -> 구 -> 동 -> 리) 루프
    for (const { key, type } of FIELDS) {
      const value = district[key];

      // 현재 필드(value)에 사용자가 검색한 토큰 중 하나라도 포함되어 있나요?
      if (
        value &&
        tokens.some((token) => {
          const idx = koreanIncludes(value, token);
          if (idx !== -1) {
            // 1. 매칭된 인덱스 중 가장 작은 값(가장 앞쪽 위치)을 기록
            minMatchIndex = Math.min(minMatchIndex, idx);
            return true;
          }
          return false;
        })
      ) {
        // 2. 가장 마지막(구체적)에 매칭된 필드 타입을 저장 (loop가 '시' -> '구' -> '동' 순서)
        // -> 정렬 시 'Dong' 매칭보다 'District' 매칭을 우선하거나, 매칭된 레벨을 UI에 표시하기 위함
        lastMatchType = type;
      }
    }

    const isExactMatch = tokens.every(
      (token) =>
        fields.some((field) => koreanIncludesExact(field, token) !== -1) ||
        koreanIncludesExact(concatenated, token) !== -1,
    );
    return {
      district,
      matchType: lastMatchType,
      isExactMatch,
      matchIndex: minMatchIndex === 999 ? 0 : minMatchIndex,
    };
  }

  // 단일 토큰: 시 → 구 → 동 → 리 순서로 매칭
  for (const { key, type } of FIELDS) {
    const value = district[key];
    if (value) {
      const idx = koreanIncludes(value, normalizedQuery);
      if (idx !== -1) {
        const isExactMatch = koreanIncludesExact(value, normalizedQuery) !== -1;
        return { district, matchType: type, isExactMatch, matchIndex: idx };
      }
    }
  }

  // 연속 입력 매칭: "경상북도의성군" → 필드를 이어붙인 문자열에서 검색
  const parts = FIELDS.map((f) => district[f.key]).filter(Boolean) as string[];
  const concatenated = parts.join("");
  const concatIndex = koreanIncludes(concatenated, normalizedQuery);
  if (concatIndex !== -1) {
    const endPos = concatIndex + normalizedQuery.length;
    let cumLen = 0;
    let matchType: LocationSearchResult["matchType"] = "city";
    for (const { key, type } of FIELDS) {
      const value = district[key];
      if (!value) continue;
      cumLen += value.length;
      matchType = type;
      if (endPos <= cumLen) break;
    }
    const isExactMatch =
      koreanIncludesExact(concatenated, normalizedQuery) !== -1;
    return { district, matchType, isExactMatch, matchIndex: concatIndex };
  }

  return null;
};

// 검색 결과 정렬: matchType → isExactMatch → 이름순
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
    // 1. 매칭 인덱스 우선 (낮은 인덱스가 먼저 나오도록: "부산" > "경상북도")
    const indexDiff = a.matchIndex - b.matchIndex;
    if (indexDiff !== 0) return indexDiff;

    // 2. matchType 우선순위 (city > district > dong > li)
    const priorityDiff =
      MATCH_PRIORITY[a.matchType] - MATCH_PRIORITY[b.matchType];
    if (priorityDiff !== 0) return priorityDiff;

    // 3. 정확 매칭 우선
    if (a.isExactMatch !== b.isExactMatch) {
      return a.isExactMatch ? -1 : 1;
    }

    // 4. 이름순 정렬
    return a.district.full.localeCompare(b.district.full, "ko");
  });
};

// 중복 제거: 같은 full 이름은 가장 구체적인 matchType, 정확 매칭 우선 유지
const deduplicateResults = (
  results: LocationSearchResult[],
): LocationSearchResult[] => {
  const seen = new Map<string, LocationSearchResult>();
  for (const result of results) {
    const key = result.district.full;
    const existing = seen.get(key);
    if (
      !existing ||
      MATCH_PRIORITY[result.matchType] < MATCH_PRIORITY[existing.matchType] ||
      (MATCH_PRIORITY[result.matchType] ===
        MATCH_PRIORITY[existing.matchType] &&
        result.isExactMatch &&
        !existing.isExactMatch)
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
 * - 결과는 정확 매칭 우선, 구체적인 매칭 우선 정렬
 */
export const searchDistricts = async (
  query: string,
  options: SearchOptions = {},
): Promise<LocationSearchResult[]> => {
  const { maxResults = 20 } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];

  const districts = await loadDistricts();
  const results: LocationSearchResult[] = [];
  for (const district of districts) {
    const result = matchDistrict(district, trimmed);
    if (result) results.push(result);
  }

  const deduplicated = deduplicateResults(results);
  const sorted = sortResults(deduplicated);

  return sorted.slice(0, maxResults);
};

export { parseDistrict };
