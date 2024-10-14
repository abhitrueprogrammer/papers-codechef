"use client";
import { Separator } from "./ui/separator";
import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Instagram, Linkedin, Youtube, Github } from "lucide-react";
import meta_icon from "../assets/meta_icon.svg";
import x_twitter_icon from "../assets/x_twitter_icon.svg";
import meta_icon_dark from "../assets/meta_icon_dark.svg";
import x_twitter_icon_dark from "../assets/x_twitter_icon_dark.svg";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(true);

  useEffect(() => {
    if (theme) {
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);

  return (
    <div className="mx-auto flex flex-col items-center justify-between gap-y-12 pt-12 md:pt-8 lg:w-full lg:flex-row lg:justify-around lg:px-12 mb-4">
      <div className="flex items-center">
        <h1 className="jost bg-gradient-to-r from-[#562EE7] to-[rgba(116,128,255,0.8)] bg-clip-text text-center text-3xl font-bold text-transparent lg:text-5xl 2xl:text-6xl dark:from-[#562EE7] dark:to-[#FFC6E8]">
          Papers
        </h1>
        <Separator orientation="vertical" className="mx-3 h-full min-h-20" />
        <div className="flex items-center">
          <Image
            src={ccLogo as HTMLImageElement}
            alt="codechef-logo"
            height={70}
            width={70}
          />
          <p className="jost text-2xl font-bold lg:text-4xl">CodeChef-VIT</p>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-x-8">
          <Link href="https://www.instagram.com/codechefvit/">
            <Button variant="ghost" size="icon">
              <Instagram />
            </Button>
          </Link>
          <Link href="https://www.linkedin.com/company/codechefvit/">
            <Button variant="ghost" size="icon">
              <Linkedin />
            </Button>
          </Link>
          <Link href="https://www.youtube.com/@CodeChefVIT">
            <Button variant="ghost" size="icon">
              <Youtube />
            </Button>
          </Link>
          <Link href="https://github.com/CodeChefVIT">
            <Button variant="ghost" size="icon">
              <Github />
            </Button>
          </Link>
          <Link href="https://www.facebook.com/codechefvit/">
            <Button variant="ghost" size="icon">
              <Image
                src={
                  isDarkMode
                    ? (meta_icon_dark as HTMLInputElement)
                    : (meta_icon as HTMLInputElement)
                }
                alt="meta-icon"
                height={24}
                width={24}
              />
            </Button>
          </Link>
          <Link href="https://x.com/codechefvit" className="pb-1.5">
            <Button variant="ghost" size="icon">
              <Image
                src={
                  isDarkMode
                    ? (x_twitter_icon_dark as HTMLInputElement)
                    : (x_twitter_icon as HTMLInputElement)
                }
                alt="x_twitter_icon"
                height={24}
                width={24}
              />
            </Button>
          </Link>
        </div>
        <p className="hidden text-center text-xl lg:block">
          Made with 💜 By Codechef-VIT
        </p>
      </div>
      <p className="block text-xl lg:hidden">Made with 💜 By Codechef-VIT</p>
    </div>
  );
}
