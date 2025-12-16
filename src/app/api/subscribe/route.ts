import { NextResponse } from "next/server";
import { appendEmailToSheet } from "@/lib/services/google-sheets";
import { verifyEmail } from "@devmehq/email-validator-js";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await verifyEmail({
      emailAddress: email,
      verifyMx: true,
      verifySmtp: false,
      timeout: 4000
    });

    if (!result.validFormat) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!result.validMx) {
      return NextResponse.json({ error: "Email domain is invalid" }, { status: 400 });
    }

    await appendEmailToSheet(email);
    return NextResponse.json({ message: "Email added successfully" });
  } catch (error) {
    console.error("Error adding email:", error);
    return NextResponse.json({ error: "Failed to add email" }, { status: 500 });
  }
} 