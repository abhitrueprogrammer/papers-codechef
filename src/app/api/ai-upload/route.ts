import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import {
  campuses,
  semesters,
  slots,
  years,
} from "@/components/select_options";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import { type ICourses, type CloudinaryUploadResult } from "@/interface";
import { PaperAdmin } from "@/db/papers";
import axios from "axios";
import processAndAnalyze from "@/util/mistral";
import { examMap } from "./map";
import Fuse from "fuse.js";
// import processAndAnalyze from "./mistral";
// TODO: REMOVE THUMBNAIL FROM admin-buffer DB
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
    const isPdf = formData.get("isPdf") === "true"; // Convert string to boolean

    let imageURL = "";
    if (isPdf) {
      imageURL = formData.get("image") as string;
    } else {
      const bytes = await files[0]?.arrayBuffer();
      if (bytes) {
        const buffer =  Buffer.from(bytes);
        imageURL = `data:${"image/png"};base64,${buffer.toString("base64")}`;
      }
    }
    const tags = await processAndAnalyze({ imageURL });
    let subject = "";
    let slot = "";
    let exam = "";
    let year = "";
    let campus = "";
    let semester = "";
    const { data } = await axios.get<ICourses[]>(
      `${process.env.SERVER_URL}/api/course-list`,
    );
    const courses = data.map((course: { name: string }) => course.name);
    const coursesFuzy = new Fuse(courses);
    if (!tags) {
      console.log("Anaylsis failed, inputing blank strings as fields");
    } else {
      const subjectSearch = coursesFuzy.search(tags["course-name"])[0];
      if (subjectSearch) {
        subject = subjectSearch.item;
      }
      const slotPattern = new RegExp(`[${tags.slot}]`, "i");
      const slotSearchResult = slots.find((s) => slotPattern.test(s));
      slot = slotSearchResult ? slotSearchResult : tags.slot;
      if ("exam-type" in tags && tags["exam-type"] in examMap) {
        const examType = tags["exam-type"] as keyof typeof examMap;
        exam = examMap[examType];
      }
      year = formData.get("year") as string;
      campus = formData.get("campus") as string;
      semester = formData.get("semester") as string;
    }
    console.log(exam, slot, subject);

    if (
      !(
        exam.includes(exam) &&
        years.includes(year) &&
        campuses.includes(campus) &&
        semesters.includes(semester)
      )
    ) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    await connectToDatabase();
    let finalUrl: string | undefined = "";
    let public_id_cloudinary: string | undefined = "";
    let thumbnailUrl: string | undefined = "";

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
        [public_id_cloudinary, finalUrl] = await uploadPDFFile(
          mergedPdfBytes,
          uploadPreset,
        );
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to process PDF" },
          { status: 500 },
        );
      }
    } else {
      [public_id_cloudinary, finalUrl] = await uploadPDFFile(
        files[0]!,
        uploadPreset,
      );
    }

    const thumbnailResponse = cloudinary.v2.image(finalUrl!, {
      format: "jpg",
    });
    thumbnailUrl = thumbnailResponse
      .replace("pdf", "jpg")
      .replace("upload", "upload/w_400,h_400,c_fill")
      .replace(/<img src='|'\s*\/>/g, "");
    const paper = new PaperAdmin({
      public_id_cloudinary,
      finalUrl,
      thumbnailUrl,
      subject,
      slot,
      year,
      exam,
      campus,
      semester,
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

async function uploadPDFFile(file: File | ArrayBuffer, uploadPreset: string) {
  let bytes;
  if (file instanceof File) {
    bytes = await file.arrayBuffer();
  } else {
    bytes = file;
  }
  return uploadFile(bytes, uploadPreset, "application/pdf");
}

async function uploadFile(
  bytes: ArrayBuffer,
  uploadPreset: string,
  fileType: string,
) {
  try {
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${fileType};base64,${buffer.toString("base64")}`;
    const uploadResult = (await cloudinary.v2.uploader.unsigned_upload(
      dataUrl,
      uploadPreset,
    )) as CloudinaryUploadResult;
    return [uploadResult.public_id, uploadResult.secure_url];
  } catch (e) {
    throw e;
  }
}

async function CreatePDF(files: File[]) {
  const pdfDoc = await PDFDocument.create();
  //sort files using name. Later remove to see if u can without names
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
