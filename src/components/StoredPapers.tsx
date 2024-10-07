"use client";
import { useEffect, useState } from "react";
import PreviewCard from "@/components/PreviewCard";
import { type Paper } from "@/interface";

function StoredPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const storedPapers = JSON.parse(
      localStorage.getItem("clickedPapers") ?? "[]"
    );

    setPapers(storedPapers);
  }, []);

  if (papers.length === 0) {
    return null;
  }

  return (
    <>
      <p className="mb-4 text-center font-semibold">Recently Viewed Papers</p>
      <div className="flex flex-wrap justify-center gap-4">
        {papers.map((paper: Paper) => (
          <PreviewCard key={paper._id} paper={paper} />
        ))}
      </div>
    </>
  );
}

export default StoredPapers;
