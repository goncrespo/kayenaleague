import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Obtener detalles de un partido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;
    const matchId = params.id;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homePlayer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            handicap: true,
            zone: true,
            phone: true,
            email: true
          }
        },
        awayPlayer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            handicap: true,
            zone: true,
            phone: true,
            email: true
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
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es parte del partido
    if (match.homePlayerId !== userId && match.awayPlayerId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este partido" },
        { status: 403 }
      );
    }

    const isHome = match.homePlayerId === userId;
    const opponent = isHome ? match.awayPlayer : match.homePlayer;
    const userScore = isHome ? match.homePlayerScore : match.awayPlayerScore;
    const opponentScore = isHome ? match.awayPlayerScore : match.homePlayerScore;

    // Obtener campos de golf disponibles para la zona
    const userZone = await prisma.user.findUnique({
      where: { id: userId },
      select: { zone: true }
    });

    const availableVenues = userZone?.zone 
      ? await prisma.partnerVenue.findMany({
          where: { zoneId: userZone.zone.id }
        })
      : [];

    const formattedMatch = {
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
      winner: match.winner,
      result: match.result,
      group: match.group,
      division: match.group?.division,
      season: match.group?.division?.season,
      availableVenues,
      canReportResult: match.status === "PENDING" && (!match.matchDate || new Date() >= match.matchDate),
      canContact: opponent.phone || opponent.email
    };

    return NextResponse.json({
      success: true,
      data: formattedMatch
    });

  } catch (error) {
    console.error("Error obteniendo detalles del partido:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Reportar resultado de un partido
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;
    const matchId = params.id;

    const body = await request.json();
    const { homeScore, awayScore, notes } = body;

    // Validar datos
    if (typeof homeScore !== "number" || typeof awayScore !== "number") {
      return NextResponse.json(
        { error: "Los puntos deben ser números" },
        { status: 400 }
      );
    }

    if (homeScore < 0 || awayScore < 0) {
      return NextResponse.json(
        { error: "Los puntos no pueden ser negativos" },
        { status: 400 }
      );
    }

    // Obtener el partido
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homePlayer: true,
        awayPlayer: true,
        result: true
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es parte del partido
    if (match.homePlayerId !== userId && match.awayPlayerId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para reportar este partido" },
        { status: 403 }
      );
    }

    // Verificar que el partido está pendiente
    if (match.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este partido ya no está pendiente" },
        { status: 400 }
      );
    }

    // Verificar que no se haya reportado ya
    if (match.result) {
      return NextResponse.json(
        { error: "Este partido ya tiene un resultado reportado" },
        { status: 400 }
      );
    }

    // Verificar fecha límite
    if (new Date() > match.deadlineDate) {
      return NextResponse.json(
        { error: "El plazo para reportar este partido ha expirado" },
        { status: 400 }
      );
    }

    // Crear el resultado
    const result = await prisma.matchResult.create({
      data: {
        matchId,
        reportedBy: userId,
        homeScore,
        awayScore,
        notes: notes || null,
        status: "PENDING"
      }
    });

    // Actualizar el partido con los puntos
    await prisma.match.update({
      where: { id: matchId },
      data: {
        homePlayerScore: homeScore,
        awayPlayerScore: awayScore
      }
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Resultado reportado exitosamente. Esperando validación del administrador."
    });

  } catch (error) {
    console.error("Error reportando resultado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}