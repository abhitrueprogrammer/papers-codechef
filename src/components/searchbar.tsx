"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Search } from "lucide-react";
import debounce from 'debounce';
import { useRouter } from "next/navigation";  
import { Input } from "@/components/ui/input";

function SearchBar () {
  const router = useRouter();  
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length > 1) {
        setLoading(true);
        try {
          const searchResponse = await axios.get("/api/search", {
            params: { text },
          });

          const { subjects } = searchResponse.data;
          const suggestionList = subjects.map((subjectObj: { subject: string }) => subjectObj.subject);
          setSuggestions(suggestionList);
          setError(null);
        } catch (error) {
          const typedError = error as AxiosError<{ message?: string }>;
          const errorMessage = typedError.response?.data?.message ?? "Error fetching suggestions";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    if (text.length <= 1) {
      setSuggestions([]);
    }
    debouncedSearch(text); 
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchText(suggestion);
    setSuggestions([]);
    router.push(`/catalogue?subject=${encodeURIComponent(suggestion)}`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mx-4 md:mx-0">
      <form className="w-full max-w-xl">
        <div className="relative">
          <Input
            type="text" 
            value={searchText} 
            onChange={handleSearchChange}
            placeholder="Search..." 
            className={`w-full rounded-xl border px-4 py-6 pr-10 bg-[#7480FF] placeholder:text-white text-white opacity-50 shadow-sm focus:outline-none focus:ring-2 ${loading ? 'opacity-70' : ''}`}
          />
          <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3" disabled>  {/* disabled={loading} */}
            <Search className="h-5 w-5 text-white opacity-50" />
          </button>
        {loading && (
          <div className="absolute z-20 w-full max-w-xl border bg-white border-[#7480FF] dark:bg-[#030712] rounded-md mt-2 p-2 text-center">
            Loading suggestions...
          </div>
        )}
        {(suggestions.length > 0 || error) && !loading && (
          <ul ref={suggestionsRef} className="absolute mx-0.5 md:mx-0 w-full text-center max-w-xl z-20 border bg-white border-[#7480FF] dark:bg-[#030712] rounded-md mt-2">
            {error ? (
              <li className="p-2 text-red">{error}</li>
            ) : (
              suggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  onClick={() => handleSelectSuggestion(suggestion)} 
                  className="cursor-pointer p-2 truncate hover:opacity-50"
                  style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                >
                  {suggestion}
                </li>
              ))
            )}
          </ul>
        )}
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
