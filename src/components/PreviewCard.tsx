import { type Paper } from "@/interface";
import Image from "next/image";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import Link from "next/link";

const PreviewCard = ({ paper }: { paper: Paper }) => {
  if (paper.finalUrl.startsWith("http://")) {
    paper.finalUrl = paper.finalUrl.replace("http://", "https://");
  }
  return (
    <div
      key={paper._id}
      className="w-56 space-y-1 rounded-xl border border-black border-opacity-50 p-4 dark:border-[#7480FF]/25"
    >
      <Link href={paper.finalUrl} target="_blank" rel="noopener noreferrer">
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={180}
          height={180}
          className="mb-2 h-[150px] w-full object-cover"
        />
      </Link>
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
