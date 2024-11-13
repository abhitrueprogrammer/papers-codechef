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

  const handleDownload = async (paper: Paper) => {
    const extension = paper.finalUrl.split(".").pop();
    const fileName = `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
    await downloadFile(paper.finalUrl, fileName);
  };

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
    } catch (error) {}
  }

  if (paper.finalUrl.startsWith("http://")) {
    paper.finalUrl = paper.finalUrl.replace("http://", "https://");
  }
  return (
    <div
      key={paper._id}
      className={`flex flex-col mb-2 justify-between w-[65%] md:w-64 space-y-1 rounded-xl border-2 bg-white dark:bg-black hover:border-[#434dba] dark:border-[#434dba] dark:hover:border-white border-black  ${checked ? "bg-[#EEF2FF] dark:bg-[#050b1f]" : ""}  p-4 `}
    >
      <Link href={`/paper/${paper._id}`} target="_blank" rel="noopener noreferrer">
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={320}
          height={180}
          className="mb-2 h-[160px] md:h-[180px] w-full object-cover"
        />
      </Link>
      
      <div className="justify-center space-y-2 h-28">
        <div className="text-sm font-sans font-medium">
          {extractBracketContent(paper.subject)}
        </div>
        <div className="text-base font-sans font-semibold">
          {extractWithoutBracketContent(paper.subject)}
        </div>
        <div className="flex gap-2 py-2">
          {capsule(paper.exam)}
          {capsule(paper.slot)}
          {capsule(paper.year)}
        </div>
      </div>

      <div className="hidden items-center pt-4 justify-between gap-2 md:flex">
        <div className="flex items-center gap-2">
          <input
            checked={checked}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded-lg"
            type="checkbox"
          />
          <p className="text-sm font-sans">Select</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/paper/${paper._id}`} target="_blank" rel="noopener noreferrer">
            <Eye size={20} />
          </Link>
          <button onClick={() => handleDownload(paper)}>
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
