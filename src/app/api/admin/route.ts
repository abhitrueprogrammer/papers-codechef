import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import {
  type IAdminUpload,
  type ConverttoPDFResponse,
  CloudinaryUploadResult,
} from "@/interface";
import Paper from "@/db/papers";
import { handleAPIError } from "@/util/error";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      return NextResponse.json({ message: "ServerMisconfig" }, { status: 500 });
    }
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const formData = await req.formData();
    const files: File[] = formData.getAll("files") as File[];

    const subject = formData.get("subject") as string;
    const slot = formData.get("slot") as string;
    const year = formData.get("year") as string;
    const exam = formData.get("exam") as string;
    const isPdf = formData.get("isPdf") === "true"; // Convert string to boolean

    await connectToDatabase();
    let finalUrl: string | undefined = "";
    let thumbnailUrl: string | undefined = "";
    const existingPaper = await Paper.findOne({
      subject,
      slot,
      year,
      exam,
    });
    if (existingPaper) {
      return NextResponse.json(
        { message: "Paper already exists" },
        { status: 409 },
      );
    }
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 },
      );
    }
    if (!isPdf) {
      try {
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
          return;
        }
        
        const mergedPdfBytes = await CreatePDF(files);
        finalUrl = await uploadPDFFile(mergedPdfBytes, uploadPreset);
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to process PDF" },
          { status: 500 },
        );
      }
    } else {
      finalUrl = await uploadPDFFile(files[0] as File, uploadPreset);
    }
    const thumbnailResponse = cloudinary.v2.image(finalUrl!, {
      format: "jpg",
    });
    thumbnailUrl = thumbnailResponse
      .replace("pdf", "jpg")
      .replace("upload", "upload/w_400,h_400,c_fill")
      .replace(/<img src='|'\s*\/>/g, "");

    const paper = new Paper({
      finalUrl,
      thumbnailUrl,
      subject,
      slot,
      year,
      exam,
    });
    await paper.save();
    return NextResponse.json(
      { status: "success", url: finalUrl, thumbnailUrl: thumbnailUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to upload papers", error },

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
    await cloudinary.v2.uploader.destroy(public_id, {
      type: type,
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete asset", error },
      { status: 500 },
    );
  }
}
async function uploadPDFFile(file: File | ArrayBuffer, uploadPreset: string) {
  let bytes;
  if(file instanceof File)
  {
    console.log("PDF file");
    bytes = await file.arrayBuffer();
  }
  else
  {
    console.log("Non PDF file");
    bytes = file as ArrayBuffer;
  }
  return uploadFile(bytes, uploadPreset, "application/pdf")
}
  async function uploadFile(bytes: ArrayBuffer, uploadPreset: string, fileType: string) {
  try {
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${fileType};base64,${buffer.toString("base64")}`;

    const uploadResult: CloudinaryUploadResult =
      await cloudinary.v2.uploader.unsigned_upload(dataUrl, uploadPreset);

    return uploadResult.secure_url;
  } catch (e) {
    throw (e);
  }
}
async function CreatePDF(files: File[]) {
  const pdfDoc = await PDFDocument.create();

  const orderedFiles = Array.from(files).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  for (const file of orderedFiles) {
    const fileBlob = new Blob([file]);
    const imgBytes = Buffer.from(await fileBlob.arrayBuffer());
    let img;
    if (file instanceof File) {
      if (file.type === "image/png") {
        img = await pdfDoc.embedPng(imgBytes);
      } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
        img = await pdfDoc.embedJpg(imgBytes);
      } else {
        continue;
      }
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    }
  }

  const mergedPdfBytes = await pdfDoc.save();
  return mergedPdfBytes;
}
