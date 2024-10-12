import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text?: string;
  replyTo?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
  }[];
};

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
];
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".gif"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const ip =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for") ??
      request.headers.get("remote-addr");

    if (!ip) {
      return NextResponse.json(
        { message: "IP address not found" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process!.env.EMAIL_PORT as string),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const slot = formData.get("slot")?.toString() ?? "";
    const subject = formData.get("subject")?.toString() ?? "";
    const exam = formData.get("exam")?.toString() ?? "";
    const year = formData.get("year")?.toString() ?? "";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Attached Files</h2>
        <p><strong>Slot:</strong> ${slot}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Exam:</strong> ${exam}</p>
        <p><strong>Year:</strong> ${year}</p>
      </div>
    `;

    const attachments: { filename: string; content: Buffer }[] = [];
    const files = formData.getAll("files");

    for (const file of files) {
      if (file instanceof Blob) {
        const fileType = file.type;
        const fileName = (file as any).name;
        const fileExtension = path.extname(fileName).toLowerCase();
        const fileSizeMB = file.size / (1024 * 1024);

        if (!ALLOWED_MIME_TYPES.includes(fileType) || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
          return NextResponse.json(
            { message: `File type not allowed: ${fileType}` },
            { status: 400 }
          );
        }

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          return NextResponse.json(
            { message: `File ${fileName} exceeds the 5MB size limit` },
            { status: 400 }
          );
        }

        const buffer = await file.arrayBuffer();
        attachments.push({
          filename: fileName,
          content: Buffer.from(buffer),
        });
      }
    }

    const mailOptions: MailOptions = {
      from: process.env.EMAIL_USER!,
      to: process.env.EMAIL_USER!,
      subject: subject,
      html: htmlContent,
      attachments,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error sending email", error: error },
      { status: 422 }
    );
  }
}
