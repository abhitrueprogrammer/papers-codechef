import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";

export async function GET() {
  try {
    await connectToDatabase();

    const selectedPapers = await Paper.find({ isSelected: true }).limit(4);

    console.log("Selected papers:", selectedPapers);
    if (selectedPapers.length === 0) {
      return NextResponse.json(
        {
          message: "No selected papers found.",
        },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(selectedPapers, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch papers.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
