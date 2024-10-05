"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import Cryptr from "cryptr";
import { Suspense } from "react";

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

const CatalogueContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (subject) {
      const fetchPapers = async () => {
        setLoading(true);

        try {
          const papersResponse = await axios.get("/api/papers", {
            params: { subject },
          });

          const { res: encryptedPapersResponse } = papersResponse.data;
          const decryptedPapersResponse = cryptr.decrypt(
            encryptedPapersResponse
          );
          const papersData: Paper[] = JSON.parse(
            decryptedPapersResponse
          ).papers;
          setPapers(papersData);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage =
              axiosError.response?.data?.message ?? "Error fetching papers";
            setError(errorMessage);
          } else {
            setError("Error fetching papers");
          }
        } finally {
          setLoading(false);
        }
      };

      void fetchPapers();
    }
  }, [subject]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => router.push("/")}
        className="mb-4 rounded-md bg-blue-500 px-4 py-2 text-white"
      >
        Back to Search
      </button>

      <h1 className="mb-4 text-2xl font-bold">Papers for {subject}</h1>
      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Loading papers...</p>
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {papers.map((paper) => (
            <div
              key={paper._id}
              className="rounded-md border bg-white p-4 shadow-md"
            >
              <h3 className="text-xl font-bold">Exam: {paper.exam}</h3>
              <p>Slot: {paper.slot}</p>
              <p>Subject: {paper.subject}</p>
              <p>Year: {paper.year}</p>

              <a
                href={paper.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Paper
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No papers available for this subject.</p>
      )}
    </div>
  );
};

const Catalogue = () => {
  return (
    <Suspense fallback={<div>Loading catalogue...</div>}>
      <CatalogueContent />
    </Suspense>
  );
};

export default Catalogue;
