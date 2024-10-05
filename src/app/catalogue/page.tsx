"use client";

import { useSearchParams, useRouter } from "next/navigation"; 
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Cryptr from "cryptr";

interface Paper {
  _id: string;
  exam: string;
  finalUrl: string;
  slot: string;
  subject: string;
  year: string;
}

const cryptr = new Cryptr(process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret");

const Catalogue = () => {
  const router = useRouter();  
  const searchParams = useSearchParams();  
  const subject = searchParams.get('subject');  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);  

  useEffect(() => {
    if (subject) {
      const fetchPapers = async () => {
        setLoading(true);  

        try {
          const papersResponse = await axios.get("http://localhost:3000/api/papers", {
            params: { subject },
          });

          const { res: encryptedPapersResponse } = papersResponse.data;
          const decryptedPapersResponse = cryptr.decrypt(encryptedPapersResponse);
          // console.log("Decrypted Papers Response:", decryptedPapersResponse); 

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

        } finally {
          setLoading(false);  
        }
      };

      fetchPapers();
    }
  }, [subject]);  

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <button onClick={() => router.push('/')} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md">
        Back to Search
      </button>

      <h1 className="text-2xl font-bold mb-4">Papers for {subject}</h1>
      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Loading papers...</p>
      ) : (
        papers.length > 0 ? (
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
        ) : (
          <p>No papers available for this subject.</p>
        )
      )}
    </div>
  );
};

export default Catalogue;
