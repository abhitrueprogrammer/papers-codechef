"use client";
import { useState } from "react";
import axios, { type AxiosError } from "axios";
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
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const searchResponse = await axios.get("http://localhost:3000/api/search", {
        params: { text: searchText },
      });

      const { res: encryptedSearchResponse } = searchResponse.data;
      const decryptedSearchResponse = cryptr.decrypt(encryptedSearchResponse);
      const fetchedPapers: Paper[] = JSON.parse(decryptedSearchResponse);

      // console.log("Decrypted Search Response:", fetchedPapers);
      setPapers(fetchedPapers);
      const papersResponse = await axios.get("http://localhost:3000/api/papers", {
        params: { subject: searchText },
      });

      const { res: encryptedPapersResponse } = papersResponse.data;
      const decryptedPapersResponse = cryptr.decrypt(encryptedPapersResponse);
      const parsedResponse = JSON.parse(decryptedPapersResponse);
      const papersData: Paper[] = parsedResponse.papers;

      // console.log("Decrypted Papers Response:", papersData);
      setPapers(papersData); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as { message: string }).message;

        setError(errorMessage ?? "Error fetching papers");
      } else {
        setError("Error fetching papers");
      }
      console.error("Error fetching papers:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col">
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <div className="relative">
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} 
          placeholder="Search..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          
          <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </button>

        </div>
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
