import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@shared/ui/icons";
import Input from "@shared/ui/input/Input";
import { useDebounce } from "@shared/lib/hooks/useDebounce";
import { searchDistricts } from "@entities/location/lib/searchDistricts";
import type { LocationSearchResult } from "@shared/types/location.types";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  // isOpen 상태 제거, 대신 focus 상태로 관리
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return searchDistricts(debouncedQuery);
  }, [debouncedQuery]);

  // 검색어가 변경되면 하이라이트 인덱스 초기화 (Render-time state update)
  const [prevDebouncedQuery, setPrevDebouncedQuery] = useState(debouncedQuery);
  if (debouncedQuery !== prevDebouncedQuery) {
    setPrevDebouncedQuery(debouncedQuery);
    setHighlightedIndex(0);
  }

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 파생 상태: 결과창 표시 여부
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

  const handleSelect = (result: LocationSearchResult) => {
    const { district } = result;

    setQuery(district.full.replace(/-/g, " "));
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setIsFocused(false);
    navigate(`/weather/${encodeURIComponent(district.full)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;
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
        if (highlightedIndex >= 0) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsFocused(false);
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
          className="pl-10 pr-4 py-3 shadow-md border-transparent hover:border-gray-200 focus:border-primary transition-all rounded-2xl"
          role="combobox"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
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
                  {result.district.full.replace(/-/g, " ")}
                </span>
                <span className="text-xs text-gray-400">
                  {result.matchType === "city"
                    ? "시/도"
                    : result.matchType === "district"
                      ? "시/군/구"
                      : "읍/면/동"}{" "}
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
