import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Paper from "@/db/papers";
import { type IPaper } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import { extractUniqueValues } from "@/lib/utils/paper-aggregation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = req.nextUrl.searchParams;
    const subject = url.get("subject");

    if (!subject) {
      return NextResponse.json(
        { message: "Subject query parameter is required" },
        { status: 400 },
      );
    }

    const escapedSubject = escapeRegExp(subject);
    const papers: IPaper[] = await Paper.find({
      subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
    });

    const uniqueValues = extractUniqueValues(papers);

    return NextResponse.json(
      {
        papers,
        ...uniqueValues,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}