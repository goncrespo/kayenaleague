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

    // Obtener los partidos pendientes del usuario
    const upcomingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { homePlayerId: userId },
          { awayPlayerId: userId }
        ],
        status: "PENDING",
        deadlineDate: { gte: new Date() }
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
        deadlineDate: "asc"
      }
    });

    // Formatear la respuesta
    const formattedMatches = upcomingMatches.map(match => ({
      id: match.id,
      roundNumber: match.roundNumber,
      status: match.status,
      deadlineDate: match.deadlineDate,
      matchDate: match.matchDate,
      matchType: match.matchType,
      isHome: match.homePlayerId === userId,
      opponent: match.homePlayerId === userId ? match.awayPlayer : match.homePlayer,
      group: match.group,
      division: match.group?.division,
      season: match.group?.division?.season,
      canReportResult: match.matchDate ? new Date() >= match.matchDate : true
    }));

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length
    });

  } catch (error) {
    console.error("Error obteniendo partidos pendientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}