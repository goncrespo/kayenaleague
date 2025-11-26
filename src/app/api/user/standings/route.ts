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
    const groupId = searchParams.get("groupId");

    // Si se especifica un grupo, obtener clasificación de ese grupo
    if (groupId) {
      const standings = await getGroupStandings(groupId);
      return NextResponse.json({
        success: true,
        data: standings
      });
    }

    // Obtener la clasificación del usuario en su grupo actual
    const userAssignment = await prisma.playerGroupAssignment.findFirst({
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

    if (!userAssignment) {
      return NextResponse.json({
        success: true,
        data: {
          message: "No estás asignado a ningún grupo actualmente",
          standings: []
        }
      });
    }

    const standings = await getGroupStandings(userAssignment.group.id);

    return NextResponse.json({
      success: true,
      data: standings
    });

  } catch (error) {
    console.error("Error obteniendo clasificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener clasificación de un grupo
async function getGroupStandings(groupId: string) {
  // Obtener todos los jugadores del grupo
  const assignments = await prisma.playerGroupAssignment.findMany({
    where: { groupId },
    include: {
      player: {
        include: {
          playerStats: true,
          zone: true
        }
      }
    }
  });

  if (assignments.length === 0) {
    return {
      group: null,
      division: null,
      season: null,
      standings: []
    };
  }

  const group = assignments[0].player.assignments[0]?.group;
  const division = group?.division;
  const season = division?.season;

  // Obtener todos los partidos del grupo
  const matches = await prisma.match.findMany({
    where: { groupId, status: "COMPLETED" },
    include: {
      winner: true
    }
  });

  // Calcular estadísticas para cada jugador
  const standings = assignments.map((assignment, index) => {
    const player = assignment.player;
    const playerMatches = matches.filter(m => 
      m.homePlayerId === player.id || m.awayPlayerId === player.id
    );

    const wins = playerMatches.filter(m => m.winner?.id === player.id).length;
    const losses = playerMatches.filter(m => m.winner && m.winner.id !== player.id).length;
    const draws = playerMatches.length - wins - losses;
    
    const points = (wins * 3) + (draws * 1);

    // Calcular diferencia de hoyos
    let holesWon = 0;
    let holesLost = 0;

    playerMatches.forEach(match => {
      if (match.homePlayerId === player.id) {
        holesWon += match.homePlayerScore || 0;
        holesLost += match.awayPlayerScore || 0;
      } else {
        holesWon += match.awayPlayerScore || 0;
        holesLost += match.homePlayerScore || 0;
      }
    });

    const holesDiff = holesWon - holesLost;

    return {
      position: 0, // Se actualizará después
      player: {
        id: player.id,
        name: player.name,
        lastName: player.lastName,
        handicap: player.handicap,
        zone: player.zone
      },
      played: playerMatches.length,
      wins,
      draws,
      losses,
      points,
      holesWon,
      holesLost,
      holesDiff
    };
  });

  // Ordenar por puntos (descendente), luego por diferencia de hoyos
  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.holesDiff - a.holesDiff;
  });

  // Asignar posiciones
  standings.forEach((standing, index) => {
    standing.position = index + 1;
  });

  // Obtener información adicional del grupo
  const groupInfo = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      division: {
        include: {
          season: true
        }
      }
    }
  });

  return {
    group: {
      id: groupInfo?.id,
      name: groupInfo?.name
    },
    division: {
      id: groupInfo?.division.id,
      name: groupInfo?.division.name
    },
    season: {
      id: groupInfo?.division.season.id,
      name: groupInfo?.division.season.name
    },
    standings
  };
}