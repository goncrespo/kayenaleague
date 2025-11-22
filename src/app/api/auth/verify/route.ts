import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  if (!token || !email) {
    return NextResponse.redirect(new URL("/signin?verify=invalid", request.url));
  }

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.identifier.toLowerCase() !== email.toLowerCase() || vt.expires < new Date()) {
    return NextResponse.redirect(new URL("/signin?verify=invalid", request.url));
  }

  await prisma.$transaction([
    prisma.user.update({ where: { email: email.toLowerCase() }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(new URL("/verify/success", request.url));
} 