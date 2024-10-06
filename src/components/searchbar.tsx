"use client";

import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { Search } from "lucide-react";
import Cryptr from "cryptr";
import debounce from 'debounce';
import { useRouter } from "next/navigation";  

const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret"
);

const SearchBar = () => {
  const router = useRouter();  
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length > 1) {
        setLoading(true);
        try {
          const searchResponse = await axios.get("/api/search", {
            params: { text },
          });

          const { res: encryptedSearchResponse } = searchResponse.data;
          const decryptedSearchResponse = cryptr.decrypt(encryptedSearchResponse);
          const { subjects } = JSON.parse(decryptedSearchResponse);
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
    [cryptr]
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col">
      <form className="w-full max-w-md">
        <div className="relative">
          <input 
            type="text" 
            value={searchText} 
            onChange={handleSearchChange}
            placeholder="Search..." 
            className={`w-full rounded-md border border-gray-300 px-4 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${loading ? 'opacity-50' : ''}`}
          />
          <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3" disabled={loading}>
            <Search className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        {loading && (
          <div className="absolute z-10 w-full max-w-md bg-white border border-gray-300 rounded-md mt-2 p-2 text-center text-gray-500">
            Loading suggestions...
          </div>
        )}
        {suggestions.length > 0 && !loading && (
          <ul className="absolute w-full text-center max-w-md z-10 bg-white border border-gray-300 rounded-md mt-2">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => handleSelectSuggestion(suggestion)} 
                className="cursor-pointer p-2 hover:bg-gray-100 truncate"
                style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
      {error && <p className="mt-4 text-red">{error}</p>}
    </div>
  );
};

export default SearchBar;
