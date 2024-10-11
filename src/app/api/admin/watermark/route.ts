import { NextApiRequest, NextApiResponse } from "next";
import { PDFDocument } from "pdf-lib";
import multer from "multer";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const upload = multer({ dest: "uploads/" });
const uploadMiddleware = promisify(upload.single("file"));

const COOKIE_NAME = "session_id";

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

  const sessionId = getSessionId(req);
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  try {
    const fileBlob = new Blob([file]);
    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);

    const watermarkImage = await pdfDoc.embedJpg(
      fs.readFileSync(path.resolve("./public/watermark.jpg")),
    );
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

    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.join(process.cwd(), `public/watermarked-${sessionId}.pdf`);
    
    await writeFile(pdfPath, pdfBytes);

    return NextResponse.json({ url: `/watermarked-${sessionId}.pdf` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}

export async function DELETE(req: Request, res: NextApiResponse) {
  const sessionId = getSessionId(req);
  const filePath = path.resolve(`./public/watermarked-${sessionId}.pdf`);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
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
    return NextResponse.json({
      error: "Failed to delete watermarked PDF file",
    }, { status: 500 });
  }
}
