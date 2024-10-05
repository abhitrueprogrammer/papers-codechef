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
    const { urls, slot, subject, exam, year, isPdf, publicIds } = body;
    let finalUrl: string | undefined = "";
    let thumbnailUrl: string | undefined = "";
    const existingPaper = await Paper.findOne({
      subject,
      slot,
      year,
      exam,
    });
    if (existingPaper) {
      console.log("Paper already exists:", existingPaper);
      NextResponse.json({ message: "Paper already exists" }, { status: 409 });
    }
    if (!isPdf) {
      // @ts-expect-error: cloudinary was dumb this time
      const response = (await cloudinary.v2.uploader.multi({
        urls: urls,
        format: "pdf",
        density: 50,
      })) as ConverttoPDFResponse;
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
      console.log("Paper saved:", publicIds);
      await Promise.all(
        publicIds.map(async (public_id) => {
          const deletionResult =
            await cloudinary.v2.uploader.destroy(public_id);
          console.log(
            `Deleted asset with public_id ${public_id}`,
            deletionResult,
          );
        }),
      );
    } else {
      finalUrl = urls[0];
      const thumbnailResponse = cloudinary.v2.image(finalUrl!, {format: "jpg"});
      thumbnailUrl = thumbnailResponse
        .replace("pdf", "jpg")
        .replace("upload", "upload/w_400,h_400,c_fill")
        .replace(/<img src='|'\s*\/>/g, '');
      
      const paper = new Paper({
        finalUrl,
        thumbnailUrl,
        subject,
        slot,
        year,
        exam,
      });
      await paper.save();
    }

    return NextResponse.json(
      { status: "success", url: finalUrl, thumbnailUrl: thumbnailUrl },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const public_id = url.searchParams.get("public_id");
    const type = url.searchParams.get("type");

    if (!public_id || !type) {
      return NextResponse.json(
        { message: "Missing parameters: public_id or type" },
        { status: 400 },
      );
    }

    const deletionResult = await cloudinary.v2.uploader.destroy(public_id, {
      type: type,
    });

    console.log("Deletion result:", deletionResult);
    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { message: "Failed to delete asset", error },
      { status: 500 },
    );
  }
}
