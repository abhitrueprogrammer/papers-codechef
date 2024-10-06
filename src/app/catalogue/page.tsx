"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import Cryptr from "cryptr";
import { Suspense } from "react";
import Image from "next/image";
import { Search, Download, Eye, Filter} from "lucide-react";
import { boolean } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { slots } from "../upload/select_options";

interface Paper {
  _id: string;
  exam: string;
  finalUrl: string;
  thumbnailUrl: string;
  slot: string;
  subject: string;
  year: string;
}

interface Filters {
  paper: Paper;
  uniqueExams: string[];
  uniqueSlots: string[];
  uniqueYears: string[];
}
const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret",
);

const CatalogueContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const exams = searchParams.get("exams")?.split(",");
  const slots = searchParams.get("slots")?.split(",");
  const years = searchParams.get("years")?.split(",");

  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<Filters>();
  
  useEffect(() => {
    if (subject) {
      const fetchPapers = async () => {
        setLoading(true);

        try {
          console.log(subject)
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
          const filters: Filters = JSON.parse(decryptedPapersResponse);
          setFilterOptions(filters);
          const papersDataWithFilters = papersData
          .filter((paper)=>{  
            const examCondition = exams && exams.length ? exams.includes(paper.exam) : true;
            const slotCondition = slots && slots.length ? slots.includes(paper.slot) : true;
            const yearCondition = years && years.length ? years.includes(paper.year) : true;
          
            return examCondition && slotCondition && yearCondition;
          })
          
          if(papersDataWithFilters.length > 0)
            // setPapers(papersData);
            
          setPapers(papersDataWithFilters);
            else
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
  }, [subject, searchParams]);
  // console.log(papers);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex mb-4 mx-40 justify-center  gap-10 items-center">
        {/* <button
          onClick={() => router.push("/")}
          className=" rounded-md bg-blue-500 px-4 py-2 text-white"
          >
          Back to Search
        </button> */}
          <div className="relative w-full">
            <div className="absolute flex-grow flex top-3 left-2">
              <Search className="w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="border w-full px-10 py-3 bg-[#7480FF33] bg-opacity-20  rounded-2xl "
              placeholder="Search..."
              ></input>
          </div>
        { subject && filterOptions && <FilterDialog subject={subject} filterOptions={filterOptions}/>}
      </div>
      {/* <h1 className="mb-4 text-2xl font-bold">Papers for {subject}</h1> */}
      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Loading papers...</p>
      ) : papers.length > 0 ? (
        <div className="flex flex-wrap gap-10">
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
    className={`space-y-1 w-56 rounded-md border border-black border-opacity-50  ${checked ? "bg-[#EEF2FF]" : "bg-white"}  p-4 `}
    >
      <Image
        src={paper.thumbnailUrl}
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
          <a
            href={paper.finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            // className="text-blue-500 hover:underline"
            >
            <Eye />
          </a>
          <a href={paper.finalUrl} download>
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
const FilterDialog = ({subject, filterOptions}: {subject:string, filterOptions: Filters}) => {
  const router = useRouter()
  const [filterExams, setuniqueExams] = useState<string[]>();
  const [FilterSlots, setFilterSlots] = useState<string[]>();
  const [filterYears, setFilterYears] = useState<string[]>();
  const handleFilterClick = () => {
    if (subject) {
      let pushContent = "/catalogue"
      if(subject)
      {
        pushContent = pushContent.concat(`?subject=${encodeURIComponent(subject)}`)
      }
      if(filterExams)
      {
        pushContent = pushContent.concat(`&exams=${encodeURIComponent(filterExams.join(','))}`)
      }
      if(FilterSlots)
      {
        pushContent= pushContent.concat(`&slots=${encodeURIComponent(FilterSlots.join(','))}`)
      }
      if(filterYears)
      {
        pushContent = pushContent.concat(`&years=${encodeURIComponent(filterYears.join(','))}`)

      }
      router.push(pushContent);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="rounded-lg bg-[#7480FF] px-8 py-3 text-white">
        <div className="flex gap-3">Filter <Filter className=""/></div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-5">Choose your filters</DialogTitle>
          <DialogDescription className="space-y-5">
            {filterOptions && (
              <div className="space-y-5">
                <MultiSelect
                  options={filterOptions.uniqueExams.map((exam: string) => ({
                    label: exam,
                    value: exam,
                  }))}
                  onValueChange={setuniqueExams}
                  placeholder="Exam"
                />
                <MultiSelect
                  options={filterOptions.uniqueSlots.map((slots: string) => ({
                    label: slots,
                    value: slots,
                  }))}
                  onValueChange={setFilterSlots}
                  placeholder="Slots"
                />
                <MultiSelect
                  options={filterOptions.uniqueYears.map((years: string) => ({
                    label: years,
                    value: years,
                  }))}
                  onValueChange={setFilterYears}
                  placeholder="Years"
                />
              </div>
            )}
            <Button variant="outline" onClick={handleFilterClick}>
              Filter
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};


function extractBracketContent(subject: string): string | null {
  const match = subject.match(/\[(.*?)\]/);
  return match && match[1] ? match[1] : "BMAT102L"; //MAKE SURE IT WORKS WHEN URL IS DONE FROM BACKEND
}

function extractWithoutBracketContent(subject: string): string {
  return subject.replace(/\s*\[.*?\]\s*/g, "").trim();
}

