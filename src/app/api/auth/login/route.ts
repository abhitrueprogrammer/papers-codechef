import { connectToDatabase } from "@/lib/mongoose";
import bcrypt from "bcrypt";
import User, { IUser } from "@/db/user";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { LoginRequest } from "@/interface";

export async function POST(req: Request, res: Response) {
  await connectToDatabase();

  const body = (await req.json()) as LoginRequest;
  const { email, password } = body;

  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid credentials" });
    }

    const token = generateToken({ userId: user._id });

    return NextResponse.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Failed to login", error });
  }
}
