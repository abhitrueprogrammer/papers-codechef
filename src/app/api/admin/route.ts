import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import { type IAdminUpload, type ConverttoPDFResponse } from "@/interface";
import Paper from "@/db/papers";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as IAdminUpload;
    const { urls, slot, subject, exam, year, isPdf } = body;
    let finalUrl: string | undefined = '';
    
    if (!isPdf) {
      // @ts-expect-error: cloudinary was dumb this time
      const response = await cloudinary.v2.uploader.multi({ urls: urls, format: "pdf", quality: "auto:best"}) as ConverttoPDFResponse
      console.log("Result:", response);
      finalUrl = response.url;
      const paper = new Paper({
        finalUrl,
        subject,
        slot,
        year,
        exam,
      });
      await paper.save();
    }
    else{
      finalUrl = urls[0];
      const paper = new Paper({
        finalUrl,
        subject,
        slot,
        year,
        exam,
      });
      await paper.save();
    }
    
    return NextResponse.json(finalUrl);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
