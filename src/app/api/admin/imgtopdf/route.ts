import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument, rgb } from "pdf-lib";
import multer from "multer";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";

const upload = multer({ dest: "uploads/" });

const uploadMiddleware = promisify(upload.array("files"));

export async function POST(req: Request, res: NextApiResponse) {
  await uploadMiddleware(req as any, res as any);

  const formData = await req.formData();
  const files = formData.getAll("files");

  if (!files) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  try {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      console.log(file);
      const fileBlob = new Blob([file]);
      const imgBytes = Buffer.from(await fileBlob.arrayBuffer());
      let img;
      if (file instanceof File) {
        if (file.type === "image/png") {
          img = await pdfDoc.embedPng(imgBytes);
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          img = await pdfDoc.embedJpg(imgBytes);
        } else {
          continue; // Skip unsupported file types
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

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(process.cwd(), "public", "merged.pdf");
    await writeFile(pdfPath, pdfBytes);

    return NextResponse.json(
      { url: `/${path.basename(pdfPath)}` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, res: NextApiResponse) {
  const filePath = path.resolve("./public/merged.pdf");
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
    return NextResponse.json(
      {
        error: "Failed to delete watermarked PDF file",
      },
      { status: 500 },
    );
  }
}
