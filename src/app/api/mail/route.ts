import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

const rateLimitStore: Record<string, { count: number; lastRequest: number }> =
  {};
function isRateLimited(ip: string) {
  const currentTime = Date.now();
  const record = rateLimitStore[ip];

  if (record) {
    if (currentTime - record.lastRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore[ip] = { count: 1, lastRequest: currentTime };
      return false;
    } else {
      if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
      } else {
        record.count++;
        record.lastRequest = currentTime;
        return false;
      }
    }
  } else {
    rateLimitStore[ip] = { count: 1, lastRequest: currentTime };
    return false;
  }
}

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
        { status: 400 },
      );
    }

    //Uncomment to enable rate-limiter

    // if (isRateLimited(ip)) {
    //   return NextResponse.json(
    //     { message: "Too many requests. Please try again later." },
    //     { status: 429 },
    //   );
    // }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process!.env.EMAIL_PORT as string),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions: MailOptions = {
      from: process.env.EMAIL_USER!,
      to: process.env.EMAIL_USER!,
      subject: "Attached Files",
      text: "Doc",
      attachments: [],
    };

    const zipFile = formData.get("zipFile");

    if (zipFile instanceof Blob) {
      const buffer = await zipFile.arrayBuffer();
      const content = Buffer.from(buffer);

      mailOptions.attachments!.push({
        filename: "files.zip",
        content: content,
      });
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error sending email", error: error },
      { status: 422 },
    );
  }
}
