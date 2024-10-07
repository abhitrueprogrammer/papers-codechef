"use client"
import { useEffect, useState } from "react";
import PreviewCard from "@/components/PreviewCard";
import { type Paper } from "@/interface";

function StoredPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    const storedPapers = JSON.parse(localStorage.getItem("clickedPapers") || "[]");

    setPapers(storedPapers);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {papers.length > 0 ? (
        papers.map((paper: Paper) => <PreviewCard key={paper._id} paper={paper} />)
      ) : (
        <p>No Previously visited papers.</p>
      )}
    </div>
  );
};

export default StoredPapers;
