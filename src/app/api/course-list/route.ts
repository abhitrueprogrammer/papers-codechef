import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { Course } from "@/db/course";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const courses = await Course.find().lean();

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch courses", error },
      { status: 500 },
    );
  }
}
