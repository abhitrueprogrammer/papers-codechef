import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/toggle-theme";
import { ArrowUpToLine } from "lucide-react";
import Link from "next/link";

function Navbar() {
  return (
    <div className="flex items-center justify-between px-4 py-6 md:px-12">
      <div className="hidden w-[20%] md:block">
        <Image
          src={ccLogo as HTMLImageElement}
          alt="codechef-logo"
          height={70}
          width={70}
        />
      </div>
      <Link href="/" className="jost bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-center text-5xl font-bold text-transparent md:w-[60%] md:text-6xl">
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
