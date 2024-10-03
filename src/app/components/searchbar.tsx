"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Search } from "lucide-react";
import Cryptr from "cryptr";

interface Paper {
  _id: string;
  exam: string;
  finalUrl: string;
  slot: string;
  subject: string;
  year: string;
}

const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret"
);

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    if (text.length > 1) {
      try {
        const searchResponse = await axios.get("http://localhost:3000/api/search", {
          params: { text },
        });

        const { res: encryptedSearchResponse } = searchResponse.data;
        const decryptedSearchResponse = cryptr.decrypt(encryptedSearchResponse);

        console.log("Decrypted Search Response:", decryptedSearchResponse); 

        const { subjects } = JSON.parse(decryptedSearchResponse); 
        const suggestionList = subjects.map((subjectObj: { subject: string }) => subjectObj.subject);
        setSuggestions(suggestionList); 
      } catch (error) {
        setError("Error fetching suggestions");
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]); 
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchText(suggestion); 
    setSuggestions([]); 

    try {
      const papersResponse = await axios.get("http://localhost:3000/api/papers", {
        params: { subject: suggestion },
      });

      const { res: encryptedPapersResponse } = papersResponse.data;
      const decryptedPapersResponse = cryptr.decrypt(encryptedPapersResponse);

      console.log("Decrypted Papers Response:", decryptedPapersResponse); 

      const papersData: Paper[] = JSON.parse(decryptedPapersResponse).papers;
      setPapers(papersData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>; 
        const errorMessage = axiosError.response?.data?.message || "Error fetching papers";
        setError(errorMessage);
      } else {
        setError("Error fetching papers");
      }
      console.error("Error fetching papers:", error);
    }
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

      {papers.length > 0 && (
        <div className="mt-4 w-full max-w-md">
          <h2 className="text-lg font-medium">Papers:</h2>
          <div className="grid grid-cols-1 gap-4">
            {papers.map((paper) => (
              <div key={paper._id} className="border rounded-md p-4 shadow-md bg-white">
                
                <h3 className="text-xl font-bold">Exam: {paper.exam}</h3>
                <p>Slot: {paper.slot}</p>
                <p>Subject: {paper.subject}</p>
                <p>Year: {paper.year}</p>
                
                <a href={paper.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View Paper
                </a>

              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-red">{error}</p>}
    </div>
  );
};

export default SearchBar;
