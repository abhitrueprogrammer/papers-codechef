import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";


export const metadata: Metadata = {
  metadataBase: new URL("https://papers.codechefvit.com/"),
  title: "Papers",
  description: "Made with ♡ by CodeChef-VIT",
  icons: [{ rel: "icon", url: "/chefshat.svg" }],
  openGraph: {
    title: "Papers",
    images: [{ url: "/cookoff.png" }],
    url: "https://papers.codechefvit.com/",
    type: "website",
    description: "Made with ♡ by CodeChef-VIT",
    siteName: "Papers",
  },
  applicationName: "Papers",
  keywords: [
    "CodeChef",
    "VIT",
    "Vellore Institute of Technology",
    "CodeChef-VIT",
    "Papers"
  ],
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
