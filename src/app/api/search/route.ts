import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const searchText = url.searchParams.get("text");
    console.log(searchText);

    if (!searchText) {
      return NextResponse.json(
        { message: "Text query parameter is required" },
        { status: 400 },
      );
    }

    const subjects = await Paper.aggregate([
      { $match: { subject: { $regex: new RegExp(searchText, "i") } } }, // case-insensitive partial match
      { $group: { _id: "$subject" } },
      { $project: { _id: 0, subject: "$_id" } },
    ]);
    console.log(subjects);

    if (subjects.length === 0) {
      return NextResponse.json(
        { message: "No subjects found for the specified text" },
        { status: 404 },
      );
    }

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch subjects", error },
      { status: 500 },
    );
  }
}
