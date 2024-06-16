import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import cloudinary from "cloudinary";
import fs from "fs";
import { PDFDocument, PDFName } from "pdf-lib";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request, res: Response) {
  try {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { url } = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await fetch(url);
    const blob = await response.blob();

    console.log("blob: ", blob);

    const pdffile = new File([blob], "download.pdf", {
      type: "application/pdf",
    });

    console.log("pdffile: ", pdffile);

    const arrayBuffer = await pdffile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Write the PDF data to a file
    const filePath = "./downloaded.pdf";
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfBytes = fs.readFileSync("downloaded.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    // await pdfDoc.compress();
    const compressedPdfBytes = await pdfDoc.save();
    fs.writeFileSync("compressed.pdf", compressedPdfBytes);

    return NextResponse.json("done");
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}
