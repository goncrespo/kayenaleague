import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[/active-league] Buscando competición activa...");
    const now = new Date();
    console.log("[/active-league] Fecha actual:", now);

    const activeCompetition = await prisma.competition.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        price: true,
      },
    });

    console.log("[/active-league] Resultado:", activeCompetition);

    if (!activeCompetition) {
      console.warn("[/active-league] No se encontró competición activa");
      return NextResponse.json({ error: "No hay ninguna liga activa" }, { status: 404 });
    }

    return NextResponse.json(activeCompetition);
  } catch (error: any) {
    console.error("[/active-league] Error capturado:", error.message || error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}