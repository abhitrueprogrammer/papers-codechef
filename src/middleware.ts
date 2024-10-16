import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: Request) {
  const authtoken = request.headers.get("Authorization");
  if (!authtoken ?? !authtoken?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authtoken.split(" ")[1];
  const isValidToken = await verifyToken(token);
  if (!isValidToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
