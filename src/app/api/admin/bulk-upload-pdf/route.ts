import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import Paper from "@/db/papers";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as Array<{
      url: string;
      slot: string;
      subject: string;
      exam: string;
      year: number;
    }>;

    const responseArray: {
      status: string;
      url: string;
      thumbnailUrl: string;
      subject: string;
      slot: string;
      year: number;
    }[] = [];

    await Promise.all(
      body.map(async (paperData) => {
        const { url, slot, subject, exam, year } = paperData;

        const existingPaper = await Paper.findOne({
          subject,
          slot,
          year,
          exam,
        });
        if (existingPaper) {
          responseArray.push({
            status: "Paper already exists",
            url: "",
            thumbnailUrl: "",
            subject,
            slot,
            year,
          });
          return;
        }

        const thumbnailResponse = cloudinary.v2.image(url, { format: "jpg" });
        const thumbnailUrl = thumbnailResponse
          .replace("pdf", "jpg")
          .replace("upload", "upload/w_400,h_400,c_fill")
          .replace(/<img src='|'\s*\/>/g, "");

        const paper = new Paper({
          finalUrl: url,
          thumbnailUrl,
          subject,
          slot,
          year,
          exam,
        });

        await paper.save();

        responseArray.push({
          status: "success",
          url: url,
          thumbnailUrl: thumbnailUrl,
          subject,
          slot,
          year,
        });
      }),
    );

    return NextResponse.json(responseArray, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upload papers", error },
      { status: 500 },
    );
  }
}
