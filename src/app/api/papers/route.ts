import { NextResponse, NextRequest } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

interface IFile {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export async function GET() {
  try {
    // await connectToDatabase();
    // const papers = await Paper.find({});
    return NextResponse.json("hello");
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch papers", error },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files");
  const imagesArray: string[] = [];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const uploadPromises = files.map(async (file: unknown) => {
    const buffer = Buffer.from(await (file as IFile).arrayBuffer());
    const filename = Date.now() + (file as IFile).name.replaceAll(" ", "_");

    try {
      await writeFile(
        path.join(process.cwd(), "public/uploads/" + filename),
        buffer,
      );
      imagesArray.push(path.join(process.cwd(), "public/uploads/" + filename));
    } catch (error) {
      console.log("Error occurred for file", (file as IFile).name, error);
      throw error;
    }

    return filename;
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
