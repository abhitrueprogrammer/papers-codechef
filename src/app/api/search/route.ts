import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { type IPaper } from "@/interface";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const searchText = url.searchParams.get("text");

    if (!searchText) {
      return NextResponse.json({ message: "Text query parameter is required" }, { status: 400 });
    }

    const subjects = await Paper.aggregate([
      { $match: { subject: { $regex: searchText, $options: "i" } } },
      { $group: { _id: "$subject" } },
      { $project: { _id: 0, subject: "$_id" } }
    ]);

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Failed to fetch subjects", error },
      { status: 500 },
    );
  }
}
