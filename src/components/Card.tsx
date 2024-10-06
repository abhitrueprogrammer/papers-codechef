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

const Card = ({
  paper,
  onSelect,
  isSelected,
}: {
  paper: Paper;
  onSelect: (paper: Paper, isSelected: boolean) => void;
  isSelected: boolean;
}) => {
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

  return (
    <div
      key={paper._id}
      className={`w-56 space-y-1 rounded-md border border-black border-opacity-50  ${checked ? "bg-[#EEF2FF]" : "bg-white"}  p-4 `}
    >
      <Image
        src={paper.thumbnailUrl}
        alt={paper.subject}
        width={320}
        height={180}
        className="mb-2 h-[180px] w-full object-cover"
      />
      <div className="text-sm font-medium">
        {extractBracketContent(paper.subject)}
      </div>
      <div className="text-md font-medium">
        {extractWithoutBracketContent(paper.subject)}
      </div>
      <div className="mb-2 flex gap-2 ">
        {capsule(paper.exam)}
        {capsule(paper.slot)}
        {capsule(paper.year)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-2 ">
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
          <a href={paper.finalUrl} target="_blank" rel="noopener noreferrer">
            <Eye />
          </a>
          <button
            onClick={() => downloadFile(paper.finalUrl, `${paper.subject}.jpg`)}
          >
            <Download />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
