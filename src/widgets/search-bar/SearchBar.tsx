import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "@shared/ui/icons";
import Input from "@shared/ui/input/Input";
import { useDebounce } from "@shared/lib/hooks/useDebounce";
import { searchDistricts } from "@entities/location/lib/searchDistricts";
import { fetchCoordinates } from "@entities/location/api/geocoding";
import type { LocationSearchResult } from "@shared/types/location.types";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      const searchResults = searchDistricts(debouncedQuery);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (result: LocationSearchResult) => {
    const { district } = result;
    const fullAddress = `${district.city} ${district.district || ""} ${district.dong || ""}`.trim();
    
    setQuery(fullAddress);
    if (inputRef.current) {
      inputRef.current.blur();
    }

    console.log(fullAddress);
    setIsOpen(false);
    setIsLoading(true);

    try {
      const coords = await fetchCoordinates(fullAddress);
      if (coords) {
        navigate(`/weather/${coords.lat}/${coords.lon}`);
      } else {
        // Fallback or error handling
        alert("해당 위치의 좌표를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to fetch coordinates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.nativeEvent.isComposing) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
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
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-4 py-3 shadow-md border-transparent hover:border-gray-200 focus:border-primary transition-all rounded-2xl"
          role="combobox"
          aria-expanded={isOpen}
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

      {isOpen && (
        <ul
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
                index === highlightedIndex ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{result.district.full.replace(/-/g, " ")}</span>
                <span className="text-xs text-gray-400">
                  {result.matchType === "city" ? "시/도" : result.matchType === "district" ? "시/군/구" : "읍/면/동"} 매칭
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
