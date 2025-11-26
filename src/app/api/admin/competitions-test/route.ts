import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const competitions = await prisma.competition.findMany({
      include: {
        players: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                handicap: true,
                city: true
              }
            }
          }
        },
        groups: {
          include: {
            matches: {
              select: {
                id: true
              }
            }
          }
        }
      },
      orderBy: [
        { startDate: "desc" },
        { city: "asc" }
      ]
    });

    // Formatear la respuesta con conteos manuales
    const formattedCompetitions = competitions.map(competition => ({
      id: competition.id,
      name: competition.name,
      description: competition.description,
      type: competition.type,
      status: competition.status,
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      isActive: competition.isActive,
      price: parseFloat(competition.price.toString()),
      city: competition.city,
      totalPlayers: competition.players.length,
      totalGroups: competition.groups.length,
      totalMatches: competition.groups.reduce((total, group) => total + group.matches.length, 0),
      players: competition.players.map(cp => ({
        id: cp.player.id,
        name: cp.player.name,
        lastName: cp.player.lastName,
        email: cp.player.email,
        handicap: cp.player.handicap,
        city: cp.player.city,
        registeredAt: cp.registeredAt.toISOString(),
        isActive: cp.isActive
      }))
    }));

    return NextResponse.json({
      success: true,
      competitions: formattedCompetitions,
      total: formattedCompetitions.length
    });

  } catch (error) {
    console.error("Error en API admin/competitions-test:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}