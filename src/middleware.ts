import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const authtoken = request.headers.get("Authorization");
  console.log("Auth token:", authtoken);
  if (typeof authtoken !== "string" ?? authtoken?.startsWith("Bearer")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/admin",
};
