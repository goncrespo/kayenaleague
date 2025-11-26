import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const competitionId = searchParams.get("competitionId");
    const unassignedOnly = searchParams.get("unassignedOnly") === "true";

    // Construir el query con filtros
    const where: any = {};

    // Filtro por búsqueda general
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por ciudad
    if (city && city !== 'ALL') {
      where.city = city;
    }

    // Si se solicitan solo jugadores no asignados a competiciones
    if (unassignedOnly) {
      where.competitionPlayers = {
        none: {}
      };
    }

    // Si se especifica una competición específica, obtener jugadores de esa competición
    if (competitionId) {
      where.competitionPlayers = {
        some: {
          competitionId: competitionId
        }
      };
    }

    // Obtener jugadores con sus estadísticas y zona
    const players = await prisma.user.findMany({
      where,
      include: {
        zone: true,
        playerStats: true,
        competitionPlayers: {
          include: {
            competition: true
          }
        }
      },
      orderBy: [
        { lastName: "asc" },
        { name: "asc" }
      ]
    });

    // Formatear la respuesta
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      lastName: player.lastName,
      email: player.email,
      handicap: player.handicap,
      phone: player.phone,
      city: player.city,
      zone: player.zone,
      licenseNumber: player.licenseNumber,
      playerStats: player.playerStats,
      competitions: player.competitionPlayers.map(cp => ({
        id: cp.competition.id,
        name: cp.competition.name,
        isActive: cp.competition.isActive
      }))
    }));

    return NextResponse.json({
      success: true,
      players: formattedPlayers,
      total: formattedPlayers.length
    });

  } catch (error) {
    console.error("Error en API admin/players-public:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}