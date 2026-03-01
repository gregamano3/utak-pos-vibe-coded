import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.delete("auth_token");
  return res;
}
