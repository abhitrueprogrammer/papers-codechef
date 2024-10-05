"use client";

import { useState, useCallback } from "react";
import axios from "axios";
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


 
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length > 1) {

        try {
          const searchResponse = await axios.get("http://localhost:3000/api/search", {
            params: { text },
          });

          const { res: encryptedSearchResponse } = searchResponse.data;
          const decryptedSearchResponse = cryptr.decrypt(encryptedSearchResponse);
          // console.log("Decrypted Search Response:", decryptedSearchResponse);

          const { subjects } = JSON.parse(decryptedSearchResponse);
          const suggestionList = subjects.map((subjectObj: { subject: string }) => subjectObj.subject);
          setSuggestions(suggestionList);
        } catch (error) {
          setError("Error fetching suggestions");

        }
      } else {
        setSuggestions([]);
      }
    }, 1000), 
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
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
          
          <input type="text" value={searchText} onChange={handleSearchChange}
            placeholder="Search..." className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>

          <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </button>

        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-2">
            {suggestions.map((suggestion, index) => (

              <li key={index} onClick={() => handleSelectSuggestion(suggestion)} className="cursor-pointer p-2 hover:bg-gray-100">
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
