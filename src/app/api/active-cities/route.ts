import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const activeCompetitions = await prisma.competition.findMany({
            where: {
                isActive: true,
            },
            select: {
                city: true,
            },
            distinct: ['city'],
        });

        const cities = activeCompetitions.map((comp) => comp.city);

        return NextResponse.json(cities);
    } catch (error) {
        console.error("Error al obtener ciudades activas:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
