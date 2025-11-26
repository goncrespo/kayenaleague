import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerIds, groupSize, competitionId } = body;

    // Validaciones
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 3) {
      return NextResponse.json({ 
        error: "Se necesitan al menos 3 jugadores" 
      }, { status: 400 });
    }

    if (!competitionId) {
      return NextResponse.json({ 
        error: "Se requiere el ID de la competición" 
      }, { status: 400 });
    }

    if (![3, 4, 5].includes(groupSize)) {
      return NextResponse.json({ 
        error: "El tamaño del grupo debe ser 3, 4 o 5" 
      }, { status: 400 });
    }

    // Verificar que la competición existe
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    });

    if (!competition) {
      return NextResponse.json({ 
        error: "Competición no encontrada" 
      }, { status: 404 });
    }

    // Buscar una división existente (tomar la primera disponible)
    const division = await prisma.division.findFirst();
    
    if (!division) {
      return NextResponse.json({ 
        error: "No hay divisiones configuradas en el sistema. Por favor, contacta al administrador." 
      }, { status: 500 });
    }

    // Verificar que todos los jugadores existen y están en la competición
    const players = await prisma.user.findMany({
      where: {
        id: { in: playerIds },
        competitionPlayers: {
          some: {
            competitionId: competitionId
          }
        }
      }
    });

    if (players.length !== playerIds.length) {
      return NextResponse.json({ 
        error: "Algunos jugadores no están registrados en esta competición o no existen" 
      }, { status: 400 });
    }

    // Verificar que los jugadores no estén ya en grupos
    const existingAssignments = await prisma.playerGroupAssignment.count({
      where: {
        playerId: { in: playerIds },
        group: {
          divisionId: division.id
        }
      }
    });

    if (existingAssignments > 0) {
      return NextResponse.json({ 
        error: "Algunos jugadores ya están asignados a grupos" 
      }, { status: 400 });
    }

    // Crear grupos y asignaciones
    const groups = [];
    const matches = [];

    for (let i = 0; i < playerIds.length; i += groupSize) {
      const groupPlayerIds = playerIds.slice(i, i + groupSize);
      const groupName = String.fromCharCode(65 + Math.floor(i / groupSize)); // A, B, C...
      
      // Crear grupo con la división
      const group = await prisma.group.create({
        data: {
          name: `Grupo ${groupName}`,
          divisionId: division.id
        }
      });

      // Asignar jugadores al grupo
      for (const playerId of groupPlayerIds) {
        await prisma.playerGroupAssignment.create({
          data: {
            playerId: playerId,
            groupId: group.id
          }
        });
      }

      // Crear partidos (todos contra todos)
      for (let j = 0; j < groupPlayerIds.length; j++) {
        for (let k = j + 1; k < groupPlayerIds.length; k++) {
          const isHome = Math.random() < 0.5;
          const [homePlayerId, awayPlayerId] = isHome 
            ? [groupPlayerIds[j], groupPlayerIds[k]]
            : [groupPlayerIds[k], groupPlayerIds[j]];
          
          const match = await prisma.match.create({
            data: {
              roundNumber: 1,
              groupId: group.id,
              homePlayerId: homePlayerId,
              awayPlayerId: awayPlayerId,
              deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
              status: 'PENDING'
            }
          });
          matches.push(match);
        }
      }

      groups.push({
        ...group,
        players: players.filter(p => groupPlayerIds.includes(p.id))
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${groups.length} grupos creados exitosamente`,
      groups: groups,
      matches: matches,
      groupsCreated: groups.length
    });

  } catch (error) {
    console.error("Error creating groups:", error);
    return NextResponse.json({ 
      error: "Error al crear grupos",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}