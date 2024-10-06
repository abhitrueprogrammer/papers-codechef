import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios, { type AxiosError } from "axios";
import Cryptr from "cryptr";
import { Button } from "@/components/ui/button";
import { type Paper, type Filters } from "@/interface";
import { FilterDialog } from "@/components/FilterDialog";
import Card from "./Card";
import { extractBracketContent } from "@/util/utils";
import { useRouter } from "next/navigation";

const cryptr = new Cryptr(
  process.env.NEXT_PUBLIC_CRYPTO_SECRET ?? "default_crypto_secret",
);

const CatalogueContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams.get("subject");
  const exams = searchParams.get("exams")?.split(",");
  const slots = searchParams.get("slots")?.split(",");
  const years = searchParams.get("years")?.split(",");
  const [selectedExams, setSelectedExams] = useState<string[] | undefined>(exams);
  const [selectedSlots, setSelectedSlots] = useState<string[] | undefined>(slots);
  const [selectedYears, setSelectedYears] = useState<string[] | undefined>(years);

  const handleResetFilters = () => {
    setSelectedExams([]);
    setSelectedSlots([]);
    setSelectedYears([]);
    router.push(`/catalogue?subject=${encodeURIComponent(subject!)}`);
  };

  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<Filters>();

  const handleSelectAll = () => setSelectedPapers(papers);
  const handleDeselectAll = () => setSelectedPapers([]);

  const handleDownloadAll = async () => {
    for (const paper of selectedPapers) {
      const extension = paper.finalUrl.split(".").pop();
      const fileName = `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
      await downloadFile(paper.finalUrl, fileName);
    }
  };

  async function downloadFile(url: string, filename: string) {
    try {
      const response = await fetch(url, { method: "GET" });
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const handleSelectPaper = (paper: Paper, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPapers((prev) => [...prev, paper]);
    } else {
      setSelectedPapers((prev) => prev.filter((p) => p._id !== paper._id));
    }
  };
  const handleApplyFilters = (exams: string[], slots: string[], years: string[]) => {
    if (subject) {
        let pushContent = "/catalogue"
        if(subject)
        {
          pushContent = pushContent.concat(`?subject=${encodeURIComponent(subject)}`)
        }
        if(exams !== undefined && exams.length > 0)
        {
          pushContent = pushContent.concat(`&exams=${encodeURIComponent(exams.join(','))}`)
        }
        if(slots !== undefined && slots.length > 0)
        {
          pushContent= pushContent.concat(`&slots=${encodeURIComponent(slots.join(','))}`)
        }
        if(years !== undefined && years.length > 0)
        {
          pushContent = pushContent.concat(`&years=${encodeURIComponent(years.join(','))}`)
  
        }
        router.push(pushContent);
      }
    setSelectedExams(exams);
    setSelectedSlots(slots);
    setSelectedYears(years);
  };

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
            encryptedPapersResponse,
          );
          const papersData: Paper[] = JSON.parse(
            decryptedPapersResponse,
          ).papers;
          const filters: Filters = JSON.parse(decryptedPapersResponse);
          setFilterOptions(filters);

          const papersDataWithFilters = papersData.filter((paper) => {
            const examCondition = exams?.length
              ? exams.includes(paper.exam)
              : true;
            const slotCondition = slots?.length
              ? slots.includes(paper.slot)
              : true;
            const yearCondition = years?.length
              ? years.includes(paper.year)
              : true;

            return examCondition && slotCondition && yearCondition;
          });

          setPapers(
            papersDataWithFilters.length > 0
              ? papersDataWithFilters
              : papersData,
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string }>;
            setError(
              axiosError.response?.data?.message ?? "Error fetching papers",
            );
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-40 mb-4 flex items-center justify-center gap-10">
        {subject && filterOptions && (
          <FilterDialog
            subject={subject}
            filterOptions={filterOptions}
            initialExams={exams}
            initialSlots={slots}
            initialYears={years}
            onReset={handleResetFilters}
            onApplyFilters={handleApplyFilters}
          />
        )}{" "}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading papers...</p>
      ) : papers.length > 0 ? (
        <>
          <div className="mb-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" onClick={handleDeselectAll}>
              Deselect All
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={selectedPapers.length === 0}
            >
              Download All ({selectedPapers.length})
            </Button>
          </div>
          <div className="flex flex-wrap gap-10">
            {papers.map((paper) => (
              <Card
                key={paper._id}
                paper={paper}
                onSelect={(p, isSelected) => handleSelectPaper(p, isSelected)}
                isSelected={selectedPapers.some((p) => p._id === paper._id)}
              />
            ))}
          </div>
        </>
      ) : (
        <p>No papers available for this subject.</p>
      )}
    </div>
  );
};

export default CatalogueContent;
