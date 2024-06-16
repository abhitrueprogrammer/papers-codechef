import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { type IPaper } from "@/interface";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");

    if (!subject) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }

    const papers: IPaper[] = await Paper.find({
      subject: { $regex: new RegExp(`^${subject}$`, "i") },
    });
    const uniqueYears = Array.from(new Set(papers.map((paper) => paper.year)));
    const uniqueSlots = Array.from(new Set(papers.map((paper) => paper.slot)));
    const uniqueExams = Array.from(new Set(papers.map((paper) => paper.exam)));

    return NextResponse.json({ papers, uniqueYears, uniqueSlots, uniqueExams });
  } catch (error) {
    console.error("Error fetching papers by subject:", error);
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
