import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city || !["MADRID", "ZARAGOZA", "VALLADOLID"].includes(city)) {
      return NextResponse.json({ error: "Ciudad no válida" }, { status: 400 });
    }

    console.log(`[/active-competition] Buscando competición activa en ${city}...`);
    const now = new Date();

    const competition = await prisma.competition.findFirst({
      where: {
        city: city as any,
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

    console.log("[/active-competition] Resultado:", competition);

    if (!competition) {
      return NextResponse.json({ error: `No hay competición activa en ${city}` }, { status: 404 });
    }

    return NextResponse.json(competition);
  } catch (error: any) {
    console.error("[/active-competition] Error:", error.message || error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}