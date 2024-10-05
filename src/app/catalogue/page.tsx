"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import Cryptr from "cryptr";
import { Suspense } from "react";
import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { boolean } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
interface Paper {
  _id: string;
  exam: string;
  finalUrl: string;
  slot: string;
  subject: string;
  year: string;
}
interface Filters{
  paper: Paper;
  uniqueExams: string [];
  uniqueSlots: string [];
  uniqueYears: string []
}
const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret",
);

const CatalogueContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<Filters []>([]);
  useEffect(() => {
    if (subject) {
      const fetchPapers = async () => {
        setLoading(true);

        try {
          const papersResponse = await axios.get("/api/papers", {
            // Digital Logic and Microprocessors[BITE202L]
            params: { subject },
          });
          const { res: encryptedPapersResponse } = papersResponse.data;
          const decryptedPapersResponse = cryptr.decrypt(
            encryptedPapersResponse,
          );
          const papersData: Paper[] = JSON.parse(
            decryptedPapersResponse,
          ).papers;
          const filters: Filters[] = JSON.parse(decryptedPapersResponse);
          setFilterOptions(filters);
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
  // console.log(papers);

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <button
        onClick={() => router.push("/")}
        className="mb-4 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
        Back to Search
      </button>
        <Dialog>
          <DialogTrigger  className=" rounded-lg bg-[#7480FF] px-8 py-3 text-white">Filter</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose your filters</DialogTitle>
              <DialogDescription>
                {}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

      {/* <h1 className="mb-4 text-2xl font-bold">Papers for {subject}</h1> */}
      {error && <p className="text-red-500">{error}</p>}


      {loading ? (
        <p>Loading papers...</p>
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-5	 gap-10">
          {papers.map((paper) => (
            <Card key={paper._id} paper={paper} />
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

function Card({ paper }: { paper: Paper }) {
  const [checked, setChecked] = useState<boolean>(false);
  function handleCheckboxChange(): void {
    setChecked(!checked);
  }

  return (
    <div
      key={paper._id}
      className={`space-y-1 rounded-md border border-black border-opacity-50  ${checked ? "bg-[#EEF2FF]" : "bg-white"}  p-4 `}
    >
      <Image
        src={paper.finalUrl}
        alt={paper.subject}
        // layout="responsive"
        width={320} // Adjust width to maintain aspect ratio if needed
        height={180} // Fixed height
        className="mb-2 h-[180px] w-full object-cover" // Ensure it takes the full width of the container
      ></Image>
      <div className="text-sm font-medium">
        {extractBracketContent(paper.subject)}
      </div>
      <div className="text-md font-medium">
        {extractWithoutBracketContent(paper.subject)}
      </div>
      {/* <p className="text-lg">{extractWithoutBracketContent(paper.subject)}</p>  */}
      <div className="mb-2 flex gap-2 ">
        {capsule(paper.exam)}
        {capsule(paper.slot)}
        {capsule(paper.year)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-2 ">
        <div className="flex items-center gap-1">
          <input
            onChange={handleCheckboxChange}
            className="h-3 w-3 rounded-lg"
            type="checkbox"
          />
          <p className="text-sm">Select</p>
        </div>
        <div className="flex gap-2">
          <Eye />
          <a
            href={paper.finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            // className="text-blue-500 hover:underline"
          >
            <Download />
          </a>
        </div>
      </div>
    </div>
  );
}

function capsule(data: string) {
  return (
    <div className=" rounded-md bg-[#7480FF] p-1 px-3 text-sm">{data}</div>
  );
}

function extractBracketContent(subject: string): string | null {
  const match = subject.match(/\[(.*?)\]/);
  return match && match[1] ? match[1] : "BMAT102L"; //MAKE SURE IT WORKS WHEN URL IS DONE FROM BACKEND
}

function extractWithoutBracketContent(subject: string): string {
  return subject.replace(/\s*\[.*?\]\s*/g, "").trim();
}
