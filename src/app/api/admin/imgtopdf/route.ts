import { type NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import multer from "multer";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const upload = multer({ dest: "uploads/" });
const uploadMiddleware = promisify(upload.array("files"));

const COOKIE_NAME = 'session_id';

function getSessionId(req: Request): string {
  const sessionId = cookies().get(COOKIE_NAME)?.value;
  
  if (!sessionId) {
    const newSessionId = uuidv4();
    cookies().set(COOKIE_NAME, newSessionId);
    return newSessionId;
  }

  return sessionId;
}

export async function POST(req: Request, res: NextApiResponse) {
  await uploadMiddleware(req as any, res as any);

  const formData = await req.formData();
  const files: File[] = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const sessionId = getSessionId(req);

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
    const mergedPdfPath = path.join(process.cwd(), "public", `merged_${sessionId}.pdf`);
    await writeFile(mergedPdfPath, mergedPdfBytes);

    const watermarkedPdfPath = path.join(process.cwd(), "public", `watermarked_${sessionId}.pdf`);
    await applyWatermark(mergedPdfBytes, watermarkedPdfPath);

    await unlink(mergedPdfPath); // Optionally delete the merged file

    return NextResponse.json({ url: `/${path.basename(watermarkedPdfPath)}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}


export async function DELETE(req: Request, res: NextApiResponse) {
  try {
    const sessionId = cookies().get(COOKIE_NAME)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found" }, { status: 400 });
    }

    const filePath = path.resolve(`./public/watermarked_${sessionId}.pdf`);

    if (fs.existsSync(filePath)) {
      await unlink(filePath); // Delete the watermarked PDF file
      return NextResponse.json(
        { message: "Deleted watermarked PDF file successfully" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: "Watermarked PDF file not found" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting PDF file:", error);
    return NextResponse.json({
      error: "Failed to delete watermarked PDF file",
    }, { status: 500 });
  }
}

async function applyWatermark(pdfBytes: Uint8Array, outputPath: string) {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const watermarkImage = await pdfDoc.embedJpg(fs.readFileSync(path.resolve("./public/watermark.jpg")));
  const pages = pdfDoc.getPages();
  const { width, height } = pages[0]!.getSize();

  pages.forEach((page) => {
    const x = width - 80;
    const y = 50;
    const watermarkWidth = 50;
    const watermarkHeight = 50;

    page.drawImage(watermarkImage, {
      x: x,
      y: y,
      width: watermarkWidth,
      height: watermarkHeight,
      opacity: 0.3,
    });
  });

  const watermarkedPdfBytes = await pdfDoc.save();
  await writeFile(outputPath, watermarkedPdfBytes);
}
