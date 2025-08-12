import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { StoredSubjects, TransformedPaper } from "@/interface";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const subjects = (await req.json()) as StoredSubjects;

    const usersPapers = await Paper.find({
      subject: { $in: subjects },
    });

    console.log("Fetched user papers:", usersPapers);

    const transformedPapers = usersPapers.reduce<TransformedPaper[]>(
      (acc, paper) => {
        const existing = acc.find((item) => item.subject === paper.subject);

        if (existing) {
          if (!existing.slots.includes(paper.slot)) {
            existing.slots.push(paper.slot);
          }
        } else {
          acc.push({ subject: paper.subject, slots: [paper.slot] });
        }

        return acc;
      },
      [],
    );

    return NextResponse.json(transformedPapers, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch papers.",
      },
      { status: 500 },
    );
  }
}
