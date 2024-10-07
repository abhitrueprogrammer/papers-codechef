import { useEffect, useState } from "react";
import { type Paper } from "@/interface";
import Image from "next/image";
import { Eye, Download } from "lucide-react";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import axios from "axios";
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

  async function downloadFile(url: string, filename: string) {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  function handleOpen() {
    window.open(paper.finalUrl, "_blank");
    const storedPapers = JSON.parse(
      localStorage.getItem("clickedPapers") ?? "[]",
    );
    const updatedPapers = [paper, ...storedPapers];
    const lastThreePapers = updatedPapers.slice(0, 4);
    localStorage.setItem("clickedPapers", JSON.stringify(lastThreePapers));
  }

  return (
    <div
      key={paper._id}
      className={`w-56 space-y-1 rounded-xl border border-black dark:border-[#7480FF]/25  ${checked ? "bg-[#EEF2FF] dark:bg-[#050b1f]" : ""}  p-4 `}
    >
      <Image
        src={paper.thumbnailUrl}
        alt={paper.subject}
        width={320}
        height={180}
        onClick={handleOpen}
        className="mb-2 h-[180px] w-full cursor-pointer object-cover"
      />

      <div className="text-sm font-medium">
        {extractBracketContent(paper.subject)}
      </div>
      <div className="text-md font-medium">
        {extractWithoutBracketContent(paper.subject)}
      </div>
      <div className="py-2 flex gap-2">
        {capsule(paper.exam)}
        {capsule(paper.slot)}
        {capsule(paper.year)}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            checked={checked}
            onChange={handleCheckboxChange}
            className="h-3 w-3 rounded-lg"
            type="checkbox"
          />
          <p className="text-sm">Select</p>
        </div>
        <div className="flex gap-2" onClick={handleOpen}>
          <Eye size={20} />
          <button
            onClick={() => downloadFile(paper.finalUrl, `${paper.subject}.jpg`)}
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
