import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Paper from "@/db/papers";

interface IFile {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export async function GET() {
  try {
    const papers = await Paper.find({});

    return NextResponse.json(papers);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const formData = await req.formData();
  const files = formData.getAll("files");
  const subject = formData.get("subject") as string;
  const slot = formData.get("slot") as string;
  const year = formData.get("year") as string;
  const exam = formData.get("exam") as string;

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const uploadPromises = files.map(async (file: unknown) => {
    const buffer = Buffer.from(await (file as IFile).arrayBuffer());
    const filename = Date.now() + (file as IFile).name.replaceAll(" ", "_");

    try {

      const newPaper = new Paper({
        file: buffer,
        subject,
        slot,
        year,
        exam,
      });

      await newPaper.save();

      return filename;
    } catch (error) {
      console.log("Error occurred for file", (file as IFile).name, error);
      throw error;
    }
  });

  try {
    const uploadedFiles = await Promise.all(uploadPromises);
    console.log("Files uploaded successfully", uploadedFiles);
    return NextResponse.json({
      Message: "Success",
      files: uploadedFiles,
      status: 201,
    });
  } catch (error) {
    console.log("Error occurred during file upload", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};
