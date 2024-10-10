import { useEffect, useState } from "react";
import { type Paper } from "@/interface";
import Image from "next/image";
import { Eye } from "lucide-react";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Card = ({
  paper,
  onSelect,
  isSelected,
}: {
  paper: Paper;
  onSelect: (paper: Paper, isSelected: boolean) => void;
  isSelected: boolean;
}) => {
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(isSelected);
  }, [isSelected]);

  function handleCheckboxChange() {
    setChecked(!checked);
    onSelect(paper, !checked);
  }

  function handleOpen() {
    const storedPapers = JSON.parse(
      localStorage.getItem("clickedPapers") ?? "[]",
    );
    const paperExists = storedPapers.some(
      (storedPaper: Paper) => storedPaper._id === paper._id,
    );
    if (!paperExists) {
      const updatedPapers = [paper, ...storedPapers];
      const lastThreePapers = updatedPapers.slice(0, 4);
      localStorage.setItem("clickedPapers", JSON.stringify(lastThreePapers));
    }
    window.open(paper.finalUrl, "_blank");
  }

  return (
    <div
      key={paper._id}
      className={`w-56 space-y-1 rounded-xl border border-black dark:border-[#7480FF]/25  ${checked ? "bg-[#EEF2FF] dark:bg-[#050b1f]" : ""}  p-4 `}
    >
      <Link href={paper.finalUrl}>
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={320}
          height={180}
          onClick={handleOpen}
          className="mb-2 h-[180px] w-full cursor-pointer object-cover"
        />
      </Link>

      <div className="text-sm font-medium">
        {extractBracketContent(paper.subject)}
      </div>
      <div className="text-md font-medium">
        {extractWithoutBracketContent(paper.subject)}
      </div>
      <div className="flex gap-2 py-2">
        {capsule(paper.exam)}
        {capsule(paper.slot)}
        {capsule(paper.year)}
      </div>
      <div className="hidden md:flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            checked={checked}
            onChange={handleCheckboxChange}
            className="h-3 w-3 rounded-lg"
            type="checkbox"
          />
          <p className="text-sm">Select</p>
        </div>
        <div className="flex gap-2">
          <Eye size={20} className="cursor-pointer" onClick={handleOpen} />
          <button
            onClick={() => {
              const iframe = document.createElement("iframe");
              iframe.style.display = "none";
              iframe.src = paper.finalUrl;
              document.body.appendChild(iframe);
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
