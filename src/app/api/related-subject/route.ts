import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { IRelatedSubject } from "@/interface";
import RelatedSubject from "@/db/relatedSubjects";
import { escapeRegExp } from "@/lib/utils/regex";

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
    const subjects: IRelatedSubject[] = await RelatedSubject.find({
      subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
    });
    
    console.log("realted", subjects);

    return NextResponse.json(
      {
        related_subjects: subjects[0]?.related_subjects
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch related subject", error },
      { status: 500 },
    );
  }
}