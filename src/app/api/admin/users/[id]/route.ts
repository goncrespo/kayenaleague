import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const data: { handicap?: number; zoneId?: string | null } = {};
    if (typeof body.handicap === "number") {
      data.handicap = body.handicap;
    }
    if (typeof body.zoneId === "string" || body.zoneId === null) {
      data.zoneId = body.zoneId;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
