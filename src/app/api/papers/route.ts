import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import { IPaper } from "@/interface";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as IPaper;
    const { tag, slot, subject, exam, year } = body;
    const result = cloudinary.v2.uploader.multi(tag, {
      format: "pdf",
      transformation: { crop: "fill", gravity: "auto" },
    });
    console.log(result);
    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
