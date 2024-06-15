import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";
import { v2 as cloudinary } from "cloudinary";
import { PostRequestBody } from "@/interface";

export async function GET() {
  try {
    const papers = await Paper.find({});

    return NextResponse.json(papers);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}

export async function POST(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const body = await req.json() as { tags: string }
    const tags: string = body.tags;
    console.log(tags);
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
