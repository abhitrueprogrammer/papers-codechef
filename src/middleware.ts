import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: Request) {
  const authtoken = request.headers.get("Authorization");
  console.log("Auth token:", authtoken);
  if (!authtoken ?? !authtoken?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authtoken.split(" ")[1];
  console.log("Token:", token);
  const isValidToken = await verifyToken(token);
  console.log("Verified token:", isValidToken);
  if (!isValidToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin", "/api/admin/watermark", "/api/admin/dashboard"],
};
