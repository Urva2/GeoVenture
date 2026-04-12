import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  compact?: boolean;
  placeholder?: string;
}

interface Suggestion {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationSearch({ onLocationSelect, compact = false, placeholder }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Record<string, Suggestion[]>>({});

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to highlight matching text
  const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="text-primary font-black">{part}</span> : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    if (cacheRef.current[query.toLowerCase()]) {
       setSuggestions(cacheRef.current[query.toLowerCase()]);
       setSelectedIndex(0);
       setIsOpen(true);
       return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
          { signal: abortController.signal }
        );
        const data = await response.json();
        const validResults = data.filter((d: any) => 
          ["city", "town", "village", "hamlet", "administrative", "suburb"].includes(d.type) || 
          d.class === "place"
        );
        const finalResults = validResults.length > 0 ? validResults : data; // Fallback to all if strict filter is empty

        cacheRef.current[query.toLowerCase()] = finalResults;
        setSuggestions(finalResults);
        setSelectedIndex(0);
        setIsOpen(true);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Geocoding error:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestion: Suggestion) => {
    const mainName = suggestion.display_name.split(",")[0].trim();
    setQuery(mainName);
    setIsOpen(false);
    onLocationSelect(parseFloat(suggestion.lat), parseFloat(suggestion.lon), mainName);
  };

  const handleManualSearch = async () => {
    if (!query || query.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        handleSelect(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${compact ? '' : 'max-w-md mx-auto'}`}>
      <div className={`relative flex items-center transition-all duration-300 ${
        compact
          ? 'bg-secondary rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50'
          : 'bg-card/95 backdrop-blur-md rounded-full border border-border shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50'
      }`}>
        <Search className={`text-muted-foreground shrink-0 transition-colors ${compact ? 'w-4 h-4 ml-3' : 'w-[18px] h-[18px] ml-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search for a location (city, place...)"}
          className={`w-full bg-transparent border-none outline-none font-medium text-foreground placeholder:text-muted-foreground placeholder:font-normal ${
            compact ? 'py-2.5 px-2.5 text-[13px]' : 'py-3.5 px-3 text-[14px]'
          }`}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length > 0) {
                handleSelect(suggestions[selectedIndex]);
              } else {
                handleManualSearch();
              }
            }
          }}
        />
        {isLoading ? (
          <Loader2 className={`text-primary animate-spin shrink-0 ${compact ? 'w-4 h-4 mr-3' : 'w-5 h-5 mr-4'}`} />
        ) : query ? (
          <button onClick={() => { setQuery(""); setSuggestions([]); setIsOpen(false); }} className={`rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 ${compact ? 'mr-2 p-1' : 'mr-3 p-1.5'}`}>
            <X className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </button>
        ) : <div className={compact ? 'w-6 shrink-0' : 'w-8 shrink-0'} />}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-300">
          {suggestions.length > 0 ? (
            <ul className="max-h-[300px] overflow-y-auto py-2 custom-scrollbar">
              {suggestions.map((s, i) => (
                <li
                  key={s.place_id || i}
                  onMouseEnter={() => setSelectedIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(s);
                  }}
                  className={`px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors border-b border-border/40 last:border-0 group ${selectedIndex === i ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  <div className={`p-1.5 rounded-full transition-colors shrink-0 mt-0.5 ${selectedIndex === i ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0 justify-center h-full">
                    <span className={`text-[14px] truncate leading-tight mb-0.5 ${selectedIndex === i ? 'font-black text-primary' : 'font-bold text-foreground'}`}>
                      <HighlightMatch text={s.display_name.split(",")[0]} query={query} />
                    </span>
                    <span className="text-[12px] font-medium text-muted-foreground truncate leading-tight">
                      <HighlightMatch text={s.display_name.split(",").slice(1).join(",").trim()} query={query} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center flex flex-col items-center justify-center text-sm text-muted-foreground">
               <div className="p-3 bg-muted rounded-full mb-3">
                 <Search className="w-6 h-6 text-muted-foreground/60" />
               </div>
               <p className="font-semibold text-foreground">No matching cities found in India</p>
               <p className="text-[13px] mt-1 text-muted-foreground/80">Check spelling or try a different place name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
