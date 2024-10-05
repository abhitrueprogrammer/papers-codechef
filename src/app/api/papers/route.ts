import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import Cryptr from "cryptr";
import { type IPaper } from "@/interface";


const cryptr = new Cryptr(process.env.CRYPTO_SECRET ?? "default_crypto_secret");

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = req.nextUrl.searchParams;
    const subject = url.get("subject");
    console.log("Subject:", subject);
    const escapeRegExp = (text: string) => {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
    const escapedSubject = escapeRegExp(subject!);

    if (!subject) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }

    const papers: IPaper[] = await Paper.find({
      subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
    });
    console.log("Papers:", papers);

    if (papers.length === 0) {
      return NextResponse.json(
        { message: "No papers found for the specified subject" },
        { status: 404 },
      );
    }
    
    const uniqueYears = Array.from(new Set(papers.map((paper) => paper.year)));
    const uniqueSlots = Array.from(new Set(papers.map((paper) => paper.slot)));
    const uniqueExams = Array.from(new Set(papers.map((paper) => paper.exam)));

    const encryptedResponse = cryptr.encrypt(
      JSON.stringify({ papers, uniqueYears, uniqueSlots, uniqueExams }),
    );

    return NextResponse.json({ res: encryptedResponse }, { status: 200 });
  } catch (error) {
    console.error("Error fetching papers by subject:", error);
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
