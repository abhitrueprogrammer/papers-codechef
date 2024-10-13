import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/toggle-theme";
import { ArrowUpToLine } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <div className="flex items-center justify-between gap-x-3 px-2 py-6 md:px-12">
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
          className="jost bg-gradient-to-r from-[#562EE7] to-[rgba(116,128,255,0.8)] bg-clip-text text-center text-5xl font-bold text-transparent dark:from-[#562EE7] dark:to-[#FFC6E8] md:w-[60%] md:text-6xl"
        >
          Papers
        </Link>
      </div>
      <div className="flex items-center justify-end gap-x-2 md:w-[20%]">
        <div className="hidden md:block">
          <ModeToggle />
        </div>

        <Link href="/upload">
          <Button
            variant="outline"
            className="mt-2 rounded-full px-6 py-4 text-xs md:mt-0 md:text-sm"
          >
            <ArrowUpToLine />
            <span>UPLOAD PAPERS</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
