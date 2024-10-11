import PreviewCard from "@/components/PreviewCard";
import { type Paper } from "@/interface";
import papers from "ongoing-papers";

function StoredPapers() {

  if (papers.length === 0) {
    return null;
  }

  return (
    <>
      <p className="mb-4 text-center font-semibold">Most Viewed Papers</p>
      <div className="flex flex-wrap justify-center gap-4">
        {papers.map((paper: Paper) => (
          <PreviewCard key={paper._id} paper={paper} />
        ))}
      </div>
    </>
  );
}

export default StoredPapers;
