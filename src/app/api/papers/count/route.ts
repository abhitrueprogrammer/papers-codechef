import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import CourseCount from "@/db/course";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const count = await CourseCount.find().lean();

    const formatted = count.map((item) => ({
      name: item.name,
      count: item.count,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch course counts", error },
      { status: 500 },
    );
  }
}
