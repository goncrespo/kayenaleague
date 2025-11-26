import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

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

    // Obtener estadísticas del jugador
    const playerStats = await prisma.playerStats.findUnique({
      where: { userId }
    });

    // Si no hay estadísticas, crearlas
    if (!playerStats) {
      await calculatePlayerStats(userId);
    }

    // Obtener estadísticas actualizadas
    const updatedStats = await prisma.playerStats.findUnique({
      where: { userId }
    });

    // Obtener partidos recientes para estadísticas adicionales
    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [
          { homePlayerId: userId },
          { awayPlayerId: userId }
        ],
        status: "COMPLETED"
      },
      include: {
        homePlayer: {
          select: { name: true, lastName: true }
        },
        awayPlayer: {
          select: { name: true, lastName: true }
        },
        winner: {
          select: { id: true }
        }
      },
      orderBy: { matchDate: "desc" },
      take: 5
    });

    // Calcular racha actual
    const streak = await calculateCurrentStreak(userId);

    // Obtener información de la liga actual
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        paid: true
      },
      include: {
        league: {
          select: {
            name: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    // Obtener posición en la clasificación
    const standings = await getUserStandings(userId);

    const stats = {
      general: updatedStats || {
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        totalPoints: 0,
        avgPoints: 0,
        holesWon: 0,
        holesLost: 0,
        holesDiff: 0,
        currentStreak: 0,
        bestStreak: 0
      },
      currentStreak: streak,
      recentMatches: recentMatches.map(match => ({
        id: match.id,
        roundNumber: match.roundNumber,
        matchDate: match.matchDate,
        isHome: match.homePlayerId === userId,
        opponent: match.homePlayerId === userId 
          ? `${match.awayPlayer.name} ${match.awayPlayer.lastName}`
          : `${match.homePlayer.name} ${match.homePlayer.lastName}`,
        isWinner: match.winner?.id === userId,
        status: match.status
      })),
      currentLeague: currentSubscription?.league,
      standings: standings,
      performance: {
        winRate: updatedStats?.totalMatches > 0 
          ? Math.round((updatedStats.wins / updatedStats.totalMatches) * 100)
          : 0,
        avgPointsPerMatch: updatedStats?.avgPoints || 0,
        holesDifference: updatedStats?.holesDiff || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función auxiliar para calcular estadísticas del jugador
async function calculatePlayerStats(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homePlayerId: userId },
        { awayPlayerId: userId }
      ],
      status: "COMPLETED"
    },
    include: {
      winner: true
    }
  });

  const totalMatches = matches.length;
  const wins = matches.filter(m => m.winner?.id === userId).length;
  const losses = matches.filter(m => m.winner && m.winner.id !== userId).length;
  const draws = totalMatches - wins - losses;

  // Calcular puntos (3 por victoria, 1 por empate)
  const totalPoints = (wins * 3) + (draws * 1);
  const avgPoints = totalMatches > 0 ? totalPoints / totalMatches : 0;

  // Calcular hoyos
  const holesWon = matches.reduce((acc, match) => {
    if (match.homePlayerId === userId) {
      return acc + (match.homePlayerScore || 0);
    } else {
      return acc + (match.awayPlayerScore || 0);
    }
  }, 0);

  const holesLost = matches.reduce((acc, match) => {
    if (match.homePlayerId === userId) {
      return acc + (match.awayPlayerScore || 0);
    } else {
      return acc + (match.homePlayerScore || 0);
    }
  }, 0);

  const holesDiff = holesWon - holesLost;

  // Calcular racha actual y mejor racha
  const streak = await calculateCurrentStreak(userId);
  const bestStreak = await calculateBestStreak(userId);

  // Actualizar o crear estadísticas
  await prisma.playerStats.upsert({
    where: { userId },
    update: {
      totalMatches,
      wins,
      draws,
      losses,
      totalPoints,
      avgPoints,
      holesWon,
      holesLost,
      holesDiff,
      currentStreak: streak,
      bestStreak
    },
    create: {
      userId,
      totalMatches,
      wins,
      draws,
      losses,
      totalPoints,
      avgPoints,
      holesWon,
      holesLost,
      holesDiff,
      currentStreak: streak,
      bestStreak
    }
  });
}

// Función auxiliar para calcular racha actual
async function calculateCurrentStreak(userId: string): Promise<number> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homePlayerId: userId },
        { awayPlayerId: userId }
      ],
      status: "COMPLETED"
    },
    include: {
      winner: true
    },
    orderBy: { matchDate: "desc" }
  });

  let streak = 0;
  for (const match of matches) {
    if (match.winner?.id === userId) {
      streak++;
    } else if (match.winner && match.winner.id !== userId) {
      break;
    }
  }

  return streak;
}

// Función auxiliar para calcular mejor racha
async function calculateBestStreak(userId: string): Promise<number> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homePlayerId: userId },
        { awayPlayerId: userId }
      ],
      status: "COMPLETED"
    },
    include: {
      winner: true
    },
    orderBy: { matchDate: "asc" }
  });

  let currentStreak = 0;
  let bestStreak = 0;

  for (const match of matches) {
    if (match.winner?.id === userId) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else if (match.winner && match.winner.id !== userId) {
      currentStreak = 0;
    }
  }

  return bestStreak;
}

// Función auxiliar para obtener clasificación del usuario
async function getUserStandings(userId: string) {
  const assignment = await prisma.playerGroupAssignment.findFirst({
    where: { playerId: userId },
    include: {
      group: {
        include: {
          division: {
            include: {
              season: true
            }
          }
        }
      }
    }
  });

  if (!assignment) {
    return null;
  }

  const groupId = assignment.group.id;
  const players = await prisma.playerGroupAssignment.findMany({
    where: { groupId },
    include: {
      player: {
        include: {
          playerStats: true
        }
      }
    }
  });

  // Calcular posiciones
  const standings = players
    .map((p, index) => ({
      position: index + 1,
      player: {
        id: p.player.id,
        name: p.player.name,
        lastName: p.player.lastName,
        handicap: p.player.handicap
      },
      stats: p.player.playerStats || {
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        totalPoints: 0,
        avgPoints: 0
      },
      isCurrentUser: p.player.id === userId
    }))
    .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
    .map((item, index) => ({
      ...item,
      position: index + 1
    }));

  const userPosition = standings.find(s => s.isCurrentUser)?.position;

  return {
    group: assignment.group.name,
    division: assignment.group.division.name,
    season: assignment.group.division.season.name,
    position: userPosition,
    totalPlayers: standings.length,
    standings
  };
}