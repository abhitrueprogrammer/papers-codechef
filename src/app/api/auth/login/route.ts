import { connectToDatabase } from "@/lib/mongoose";
import bcrypt from "bcrypt";
import User, { type IUser } from "@/db/user";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type LoginRequest } from "@/interface";

export async function POST(req: Request) {
  await connectToDatabase();

  const body = (await req.json()) as LoginRequest;
  const { email, password } = body;

  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await generateToken({ userId: user._id });

    console.log("User logged in:", token);

    return NextResponse.json({
      token,
      user: { id: user._id, email: user.email },
    }, { status: 200 });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Failed to login", error }, { status: 500 });
  }
}
