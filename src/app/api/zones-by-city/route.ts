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
      // orderBy removed to avoid potential enum sorting issues
    });

    // Mapear los nombres de zona a español
    const formattedZones = zones.map(zone => {
      // Formatear: NORESTE -> Noreste
      const label = zone.name.charAt(0).toUpperCase() + zone.name.slice(1).toLowerCase();
      return {
        id: zone.id,
        name: zone.name,
        label: label,
        description: zone.description,
      };
    });

    return NextResponse.json(formattedZones);
  } catch (error) {
    console.error("Error al obtener las zonas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}