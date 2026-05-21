import { NextResponse } from "next/server";
import { getTokenCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getTokenCookieName(), "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
