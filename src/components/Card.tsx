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
    } catch (error) {
      console.error("Error downloading file:", error);
    }
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
      <Link
        href={"https://mag.wcoomd.org/uploads/2018/05/blank.pdf"}
        rel="noopener noreferrer"
      >
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={320}
          height={180}
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
      <div className="hidden items-center justify-between gap-2 md:flex">
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
          <button onClick={() => handleDownload(paper)}>
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
