import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    if (!city || !["MADRID", "ZARAGOZA", "VALLADOLID"].includes(city)) {
      return NextResponse.json(
        { error: "Ciudad no válida" },
        { status: 400 }
      );
    }

    // Obtener todas las zonas activas
    const zones = await prisma.zone.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Mapear los nombres de zona a español
    const zoneNamesInSpanish = {
      NORTE: "Norte",
      SUR: "Sur", 
      CENTRO: "Centro",
      ESTE: "Este",
      OESTE: "Oeste",
    };

    const formattedZones = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      label: zoneNamesInSpanish[zone.name as keyof typeof zoneNamesInSpanish] || zone.name,
      description: zone.description,
    }));

    return NextResponse.json(formattedZones);
  } catch (error) {
    console.error("Error al obtener las zonas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}