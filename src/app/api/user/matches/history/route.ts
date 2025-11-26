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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";

    // Construir el filtro de estado
    const statusFilter = status === "all" 
      ? { status: { in: ["COMPLETED", "CONFIRMED", "CANCELLED"] } }
      : { status: status as any };

    // Obtener el historial de partidos del usuario
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homePlayerId: userId },
          { awayPlayerId: userId }
        ],
        ...statusFilter
      },
      include: {
        homePlayer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            handicap: true,
            zone: true
          }
        },
        awayPlayer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            handicap: true,
            zone: true
          }
        },
        winner: {
          select: {
            id: true,
            name: true,
            lastName: true
          }
        },
        result: {
          include: {
            match: {
              select: {
                homePlayerScore: true,
                awayPlayerScore: true
              }
            }
          }
        },
        group: {
          select: {
            name: true,
            division: {
              select: {
                name: true,
                season: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        matchDate: "desc"
      },
      take: limit
    });

    // Formatear la respuesta
    const formattedMatches = matches.map(match => {
      const isHome = match.homePlayerId === userId;
      const opponent = isHome ? match.awayPlayer : match.homePlayer;
      const userScore = isHome ? match.homePlayerScore : match.awayPlayerScore;
      const opponentScore = isHome ? match.awayPlayerScore : match.homePlayerScore;
      const isWinner = match.winner?.id === userId;

      return {
        id: match.id,
        roundNumber: match.roundNumber,
        status: match.status,
        matchDate: match.matchDate,
        deadlineDate: match.deadlineDate,
        matchType: match.matchType,
        isHome,
        opponent,
        userScore,
        opponentScore,
        isWinner,
        result: match.result,
        group: match.group,
        division: match.group?.division,
        season: match.group?.division?.season
      };
    });

    // Calcular estadísticas básicas
    const stats = {
      total: formattedMatches.length,
      wins: formattedMatches.filter(m => m.isWinner).length,
      losses: formattedMatches.filter(m => !m.isWinner && m.status === "COMPLETED").length,
      winRate: formattedMatches.length > 0 
        ? Math.round((formattedMatches.filter(m => m.isWinner).length / formattedMatches.length) * 100)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      stats,
      count: formattedMatches.length
    });

  } catch (error) {
    console.error("Error obteniendo historial de partidos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}