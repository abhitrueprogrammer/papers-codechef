import { connectToDatabase } from "@/lib/mongoose";
import bcrypt from "bcrypt";
import User, { IUser } from "@/db/user";
import { generateToken } from "@/lib/auth";
import { LoginRequest } from "@/interface";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  await connectToDatabase();

  const body = (await req.json()) as LoginRequest;
  const { email, password } = body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = generateToken({ userId: newUser._id });

    return NextResponse.json({
      token,
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    console.error("Error signing up:", error);
    return NextResponse.json({ message: "Failed to sign up", error });
  }
}
