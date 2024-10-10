import { type Paper } from "@/interface";
import Image from "next/image";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import Link from "next/link";

const PreviewCard = ({ paper }: { paper: Paper }) => {

  function handleOpen(event: React.MouseEvent) {
    event.stopPropagation();
    const link = document.createElement("a");
    link.href = paper.finalUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <div
      key={paper._id}
      className="w-56 space-y-1 rounded-xl border border-black border-opacity-50 p-4 dark:border-[#7480FF]/25"
    >
      <button onClick={handleOpen} className="w-full">
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={180}
          height={180}
          className="mb-2 h-[150px] w-full object-cover"
        />
      </button>
      <div className="text-sm font-medium">
        {extractBracketContent(paper.subject)}
      </div>
      <div className="text-md font-medium">
        {extractWithoutBracketContent(paper.subject)}
      </div>
      <div className="mb-2 flex gap-2">
        {capsule(paper.exam)}
        {capsule(paper.slot)}
        {capsule(paper.year)}
      </div>
    </div>
  );
};

export default PreviewCard;
