import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Obtener información de la zona del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    // Obtener información del usuario con su zona
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        zone: {
          include: {
            venues: true,
            users: {
              select: {
                id: true,
                name: true,
                lastName: true,
                handicap: true
              }
            }
          }
        },
        zonePreference: {
          include: {
            homeZone: true
          }
        },
        playerStats: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener jugadores de la misma zona
    const zonePlayers = user.zone?.users.filter(u => u.id !== userId) || [];

    // Obtener estadísticas de la zona
    const zoneStats = await calculateZoneStats(user.zone?.id);

    // Obtener campos de golf disponibles
    const availableVenues = user.zone?.venues || [];

    // Obtener todos los partidos de la zona
    const zoneMatches = await getZoneMatches(user.zone?.id);

    const zoneInfo = {
      userZone: user.zone,
      zonePreference: user.zonePreference,
      userStats: user.playerStats,
      playersInZone: zonePlayers.length,
      zoneStats,
      availableVenues,
      recentMatches: zoneMatches,
      canChangeZone: !user.zonePreference // Puede cambiar si no tiene preferencias establecidas
    };

    return NextResponse.json({
      success: true,
      data: zoneInfo
    });

  } catch (error) {
    console.error("Error obteniendo información de zona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Actualizar preferencias de zona
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();

    const { homeZoneId, travelRange, preferences } = body;

    // Validar datos
    if (!homeZoneId) {
      return NextResponse.json(
        { error: "La zona de preferencia es requerida" },
        { status: 400 }
      );
    }

    if (travelRange && (travelRange < 1 || travelRange > 50)) {
      return NextResponse.json(
        { error: "El rango de viaje debe estar entre 1 y 50 km" },
        { status: 400 }
      );
    }

    // Verificar que la zona existe
    const zone = await prisma.zone.findUnique({
      where: { id: homeZoneId }
    });

    if (!zone) {
      return NextResponse.json(
        { error: "La zona especificada no existe" },
        { status: 404 }
      );
    }

    // Actualizar o crear preferencias
    const zonePreference = await prisma.zonePreference.upsert({
      where: { userId },
      update: {
        homeZoneId,
        travelRange: travelRange || 10,
        preferences: preferences || {}
      },
      create: {
        userId,
        homeZoneId,
        travelRange: travelRange || 10,
        preferences: preferences || {}
      }
    });

    // Actualizar la zona del usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        zoneId: homeZoneId
      }
    });

    return NextResponse.json({
      success: true,
      data: zonePreference,
      message: "Preferencias de zona actualizadas exitosamente"
    });

  } catch (error) {
    console.error("Error actualizando preferencias de zona:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Funciones auxiliares
async function calculateZoneStats(zoneId?: string) {
  if (!zoneId) return null;

  const zoneUsers = await prisma.user.findMany({
    where: { zoneId },
    include: {
      playerStats: true,
      matchesAsHomePlayer: {
        where: { status: "COMPLETED" }
      },
      matchesAsAwayPlayer: {
        where: { status: "COMPLETED" }
      }
    }
  });

  const totalPlayers = zoneUsers.length;
  const activePlayers = zoneUsers.filter(u => u.playerStats && u.playerStats.totalMatches > 0).length;
  
  const totalMatches = zoneUsers.reduce((acc, user) => {
    return acc + user.matchesAsHomePlayer.length + user.matchesAsAwayPlayer.length;
  }, 0);

  const avgHandicap = totalPlayers > 0 
    ? zoneUsers.reduce((acc, user) => acc + (user.handicap || 0), 0) / totalPlayers
    : 0;

  return {
    totalPlayers,
    activePlayers,
    totalMatches,
    avgHandicap: Math.round(avgHandicap * 10) / 10,
    activityRate: totalPlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0
  };
}

async function getZoneMatches(zoneId?: string) {
  if (!zoneId) return [];

  const users = await prisma.user.findMany({
    where: { zoneId },
    select: { id: true }
  });

  const userIds = users.map(u => u.id);

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homePlayerId: { in: userIds } },
        { awayPlayerId: { in: userIds } }
      ],
      status: "COMPLETED"
    },
    include: {
      homePlayer: {
        select: { name: true, lastName: true, zone: true }
      },
      awayPlayer: {
        select: { name: true, lastName: true, zone: true }
      },
      winner: {
        select: { name: true, lastName: true }
      }
    },
    orderBy: { matchDate: "desc" },
    take: 5
  });

  return matches.map(match => ({
    id: match.id,
    roundNumber: match.roundNumber,
    matchDate: match.matchDate,
    homePlayer: match.homePlayer,
    awayPlayer: match.awayPlayer,
    winner: match.winner,
    status: match.status
  }));
}