import { type IPaper } from "@/interface";
import Image from "next/image";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import Link from "next/link";

const PreviewCard = ({ paper }: { paper: IPaper }) => {
  if (paper.finalUrl.startsWith("http://")) {
    paper.finalUrl = paper.finalUrl.replace("http://", "https://");
  }
  return (
    <div
      key={paper._id}
      className="w-[60%] md:w-56 space-y-1 rounded-xl border-2 bg-white dark:bg-black hover:border-[#434dba] dark:hover:border-white border-black p-4 dark:border-[#434dba]"
    >
      <Link href={`/paper/${paper._id}`} target="_blank" rel="noopener noreferrer">
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={180}
          height={180}
          className="mb-2 h-[156px] md:h-[170px] w-full object-cover"
        />
      </Link>
      
      <div className="flex flex-col justify-center space-y-2 h-28">
        <div className="text-sm font-sans font-medium">
          {extractBracketContent(paper.subject)}
        </div>
        <div className="text-base font-sans cursor-pointer font-semibold">
          {extractWithoutBracketContent(paper.subject)}
        </div>
        <div className="flex gap-2">
          {capsule(paper.exam)}
          {capsule(paper.slot)}
          {capsule(paper.year)}
        </div>
      </div>
    
    </div>
  );
};

export default PreviewCard;
