import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/toggle-theme";
import { ArrowUpToLine } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <div className="flex items-center justify-between gap-x-3 w-[90%] md:w-full overflow-x-hidden px-2 py-6 md:px-12">
      <div className="hidden w-[20%] md:block">
        <a href="https://www.codechefvit.com/" className="inline-block">
          <Image
            src={ccLogo as HTMLImageElement}
            alt="codechef-logo"
            height={70}
            width={70}
          />
        </a>
      </div>
      <div>
        <Link
          href="/"
          className="jost tracking-wide bg-gradient-to-r from-[#562EE7] to-[rgba(116,128,255,0.8)] bg-clip-text text-center text-4xl font-extrabold text-transparent dark:from-[#562EE7] dark:to-[#FFC6E8] md:w-[60%] md:text-6xl"
        >
          Papers
        </Link>
      </div>
      <div className="flex items-center justify-end gap-x-2 md:w-[20%]">
        <div className="hidden md:block">
          <ModeToggle />
        </div>

        <Link href="/upload">
          <div className="md:p-[2px] bg-gradient-to-r from-[#562EE7] to-[#bd21b4] rounded-full">
              <div className="whitespace-nowrap rounded-full font-bold text-xs md:text-sm mt-2 md:mt-0 bg-slate-200 dark:bg-black px-4 md:px-6 py-3 tracking-wider text-black dark:text-white font-sans hover:bg-white dark:hover:bg-slate-700">
              ⇱ UPLOAD PAPERS
              </div>
            </div>
        </Link>

      </div>
    </div>
  );
}

export default Navbar;
