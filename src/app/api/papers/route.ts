import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import { type IPaper } from "@/interface";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as IPaper;
    const { urls, slot, subject, exam, year } = body;
    // @ts-expect-error: cloudinary was dumb this time
    const result = cloudinary.v2.uploader.multi({ urls: urls, format: "pdf" });
    console.log(result);
    return NextResponse.json(urls);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
