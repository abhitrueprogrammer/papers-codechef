import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/toggle-theme";
import { ArrowUpToLine } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <div className="flex items-center justify-between px-4 py-6 md:px-12">
      <div className="hiddaen w-[20%] md:block">
        <a href="https://www.codechefvit.com/">
          <Image
            src={ccLogo as HTMLImageElement}
            alt="codechef-logo"
            height={70}
            width={70}
          />
        </a>
      </div>
      <Link href="/" className="jost bg-gradient-to-r from-[#562EE7] to-[#FFC6E8] bg-clip-text text-center text-5xl font-bold text-transparent md:w-[60%] md:text-6xl">
        Papers
      </Link>
      <div className="flex items-center justify-end gap-x-2 md:w-[20%]">
        <div className="hidden md:block">
          <ModeToggle />
        </div>

        <Link href="/upload">
          <Button
            variant="outline"
            className="rounded-full px-6 py-4 text-xs md:text-sm"
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
