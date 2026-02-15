import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@shared/ui/icons";
import Input from "@shared/ui/input/Input";
import { useDebounce } from "@shared/lib/hooks/useDebounce";
import {
  searchDistricts,
  koreanIncludes,
} from "@entities/location/lib/searchDistricts";
import { fetchCoordinates } from "@entities/location/api/geocoding";
import { toast } from "@shared/ui/toast";
import type { LocationSearchResult } from "@shared/types/location.types";

/**
 * 검색 결과 내 매칭 텍스트 하이라이팅 컴포넌트
 * - 복합 쿼리: 각 토큰별 개별 하이라이팅
 * - 연속 입력: 공백 제거 후 매칭 → 원본 위치에 하이라이팅
 */
const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;

  // 공백 제거 폴백: 토큰이 연속 입력일 때 텍스트에서 공백 제거 후 매칭
  const findRangeWithStrip = (
    target: string,
    token: string,
  ): [number, number] | null => {
    const indexMap: number[] = [];
    for (let i = 0; i < target.length; i++) {
      if (target[i] !== " ") indexMap.push(i);
    }
    const stripped = target.replace(/ /g, "");
    const idx = koreanIncludes(stripped, token);
    if (idx === -1) return null;
    const end = Math.min(idx + token.length - 1, indexMap.length - 1);
    return [indexMap[idx], indexMap[end] + 1];
  };

  const ranges: [number, number][] = [];
  const tokens = query.trim().split(/\s+/);

  for (const token of tokens) {
    const startIndex = koreanIncludes(text, token);
    if (startIndex !== -1) {
      ranges.push([startIndex, startIndex + token.length]);
    } else {
      // 연속 입력 폴백
      const range = findRangeWithStrip(text, token);
      if (range) ranges.push(range);
    }
  }

  if (ranges.length === 0) return <span>{text}</span>;

  // 정렬 및 겹치는 구간 병합
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) {
      last[1] = Math.max(last[1], ranges[i][1]);
    } else {
      merged.push(ranges[i]);
    }
  }

  // 세그먼트 렌더링
  const segments: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (cursor < start) {
      segments.push(text.substring(cursor, start));
    }
    segments.push(
      <span key={start} className="font-bold text-primary">
        {text.substring(start, end)}
      </span>,
    );
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push(text.substring(cursor));
  }

  return <span>{segments}</span>;
};
const SearchBar = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // isOpen 상태 제거, 대신 focus 상태로 관리
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [prevDebouncedQuery, setPrevDebouncedQuery] = useState(debouncedQuery);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 검색 결과 계산 (useMemo 사용)
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchDistricts(debouncedQuery);
  }, [debouncedQuery]);

  // 검색어가 변경되면 하이라이트 인덱스 초기화 (render phase adjustment)
  if (debouncedQuery !== prevDebouncedQuery) {
    setPrevDebouncedQuery(debouncedQuery);
    setHighlightedIndex(debouncedQuery.trim() ? 0 : -1);
  }

  // 파생 상태: 결과창 표시 여부 (isFocused와 결과 존재 여부로만 결정)
  const showResults = isFocused && results.length > 0;

  useEffect(() => {
    if (showResults && listRef.current && highlightedIndex >= 0) {
      const list = listRef.current;
      const element = list.children[highlightedIndex] as HTMLElement;
      if (element) {
        element.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex, showResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (result: LocationSearchResult) => {
    const { district } = result;
    const fullAddress =
      `${district.city} ${district.district || ""} ${district.dong || ""} ${district.li || ""}`.trim();

    setQuery(fullAddress);
    if (inputRef.current) {
      inputRef.current.blur();
    }

    setIsLoading(true);

    try {
      const coords = await fetchCoordinates(fullAddress);
      if (coords) {
        navigate(`/weather/${encodeURIComponent(district.full)}`);
      } else {
        toast.error("해당 위치의 좌표를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch coordinates:", error);
      toast.error("위치 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    // IME 입력 중 엔터키 등 중복 이벤트 방지
    if (e.nativeEvent.isComposing) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + results.length) % results.length,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsFocused(false);
        if (inputRef.current) inputRef.current.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <SearchIcon />
        </div>
        <Input
          type="search"
          placeholder="지역을 검색하세요 (예: 서울, 강남구, 청운동)"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="pl-10 pr-4 py-3 shadow-md border-transparent hover:border-gray-200 focus:border-primary transition-all rounded-2xl"
          role="combobox"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {showResults && (
        <ul
          ref={listRef}
          id="search-results"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          {results.map((result, index) => (
            <li
              key={result.district.full}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-6 py-3.5 cursor-pointer transition-colors flex items-center gap-3 ${
                index === highlightedIndex
                  ? "bg-primary/5 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  <HighlightText
                    text={result.district.full.replace(/-/g, " ")}
                    query={debouncedQuery}
                  />
                </span>
                <span className="text-xs text-gray-400">
                  {result.matchType === "city"
                    ? "시/도"
                    : result.matchType === "district"
                      ? "시/군/구"
                      : result.matchType === "dong"
                        ? "읍/면/동"
                        : "리"}{" "}
                  매칭
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
