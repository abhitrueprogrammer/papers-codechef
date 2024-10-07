import { Separator } from "./ui/separator";
import ccLogo from "../assets/codechef_logo.svg";
import Image from "next/image";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import meta_icon from "../assets/meta_icon.svg";
import x_twitter_icon from "../assets/x_twitter_icon.svg";
import meta_icon_dark from "../assets/meta_icon_dark.svg";
import x_twitter_icon_dark from "../assets/x_twitter_icon_dark.svg";

export default function Footer() {
  return (
    <div className="flex md:flex-row flex-col gap-y-12 max-w-7xl mx-auto items-center justify-between pt-12">
      <div className="flex items-center">
        <h1 className="jost bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-center text-3xl md:text-5xl font-bold text-transparent">
          Papers
        </h1>
        <Separator orientation="vertical" className="min-h-20 h-full mx-3" />
        <div className="flex items-center">
          <Image
            src={ccLogo as HTMLImageElement}
            alt="codechef-logo"
            height={70}
            width={70}
          />
          <p className="jost text-2xl md:text-4xl font-bold">CodeChef-VIT</p>
        </div>
      </div>

      <p className="text-xl md:block hidden">Made with Love By Codechef-VIT</p>
      <div className="flex gap-x-8 items-center">
        <Instagram />
        <Linkedin />
        <Youtube />
        <Image src={meta_icon} alt="meta-icon" height={24} width={24} className="dark:hidden"/>
        <Image src={x_twitter_icon} alt="x_twitter_icon" className="dark:hidden" height={24} width={24} />
        <Image src={meta_icon_dark} alt="meta-icon" className="hidden dark:block" height={24} width={24} />
        <Image src={x_twitter_icon_dark} alt="x_twitter_icon" className="hidden dark:block mb-2" height={24} width={24} />
      </div>
      <p className="text-xl block md:hidden">Made with Love By Codechef-VIT</p>
    </div>
  );
}
