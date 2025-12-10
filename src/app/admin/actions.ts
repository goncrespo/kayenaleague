"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Crea una nueva liga
 * @param name - Nombre de la liga
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Mensaje de éxito o error
 */
export async function createLeague(
  name: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; message: string; leagueId?: string }> {
  try {
    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { success: false, message: "La fecha de inicio debe ser anterior a la fecha de fin" };
    }

    // Crear la liga
    const league = await prisma.league.create({
      data: {
        name,
        startDate: start,
        endDate: end,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Liga "${name}" creada exitosamente`,
      leagueId: league.id
    };

  } catch (error) {
    console.error("Error creando liga:", error);
    return {
      success: false,
      message: "Error interno del servidor al crear la liga"
    };
  }
}

/**
 * Crea grupos con número personalizado de jugadores, agrupando por zonas de usuarios
 * @param leagueId - ID de la liga
 * @param playersPerGroup - Número de jugadores por grupo
 * @returns Mensaje de éxito o error
 */
export async function createGroups(
  leagueId: string,
  playersPerGroup: number = 4
): Promise<{ success: boolean; message: string }> {
  try {
    // Validar parámetros
    if (playersPerGroup < 2 || playersPerGroup > 8) {
      return { success: false, message: "El número de jugadores por grupo debe estar entre 2 y 8" };
    }

    // Verificar que la liga existe
    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) {
      return { success: false, message: "Liga no encontrada" };
    }

    // Obtener usuarios suscritos (pagados) con su zona
    const subscriptions = await prisma.subscription.findMany({
      where: { leagueId, paid: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            handicap: true,
            zoneId: true,
          }
        }
      }
    });

    type SimpleUser = {
      id: string;
      name: string | null;
      email: string | null;
      handicap: number;
      zoneId: string | null;
    };

    const subscribedUsers: SimpleUser[] = subscriptions.map((s) => ({
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      handicap: s.user.handicap,
      zoneId: s.user.zoneId ?? null,
    }));

    if (subscribedUsers.length === 0) {
      return { success: false, message: "No hay usuarios suscritos con zona definida" };
    }

    // Agrupar usuarios por zona
    const usersByZone: Record<string, SimpleUser[]> = {};
    for (const user of subscribedUsers) {
      const zid = user.zoneId || undefined;
      if (!zid) continue;
      if (!usersByZone[zid]) usersByZone[zid] = [];
      usersByZone[zid].push(user);
    }

    // Crear división para la liga si no existe
    let division = await prisma.division.findFirst({
      where: { leagueId }
    });

    if (!division) {
      division = await prisma.division.create({
        data: {
          name: "División Principal",
          levelOrder: 1,
          seasonId: "default-season", // Necesitarás crear una temporada por defecto
          leagueId
        }
      });
    }

    let totalGroupsCreated = 0;
    let globalGroupNumber = 1;

    // Ordenar zonas por nombre para consistencia
    const sortedZoneEntries = Object.entries(usersByZone).sort(([a], [b]) => a.localeCompare(b));

    // Crear grupos procesando zona por zona
    for (const [zoneId, users] of sortedZoneEntries as Array<[string, SimpleUser[]]>) {
      const zoneName = `Zona ${zoneId.slice(0, 6)}`;

      // Mezclar usuarios aleatoriamente dentro de la zona
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

      // Crear grupos con el número especificado de jugadores
      for (let i = 0; i < shuffledUsers.length; i += playersPerGroup) {
        const groupUsers = shuffledUsers.slice(i, i + playersPerGroup);

        if (groupUsers.length === playersPerGroup) {
          // Crear el grupo con tag de zona
          const group = await prisma.group.create({
            data: {
              name: `Grupo ${globalGroupNumber} (${zoneName})`,
              divisionId: division.id
            }
          });

          // Asignar jugadores al grupo
          await Promise.all(
            groupUsers.map(user =>
              prisma.playerGroupAssignment.create({
                data: {
                  playerId: user.id,
                  groupId: group.id
                }
              })
            )
          );

          totalGroupsCreated++;
          globalGroupNumber++;
        }
      }
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: `Se crearon ${totalGroupsCreated} grupos exitosamente con ${playersPerGroup} jugadores cada uno`
    };

  } catch (error) {
    console.error("Error creando grupos:", error);
    return {
      success: false,
      message: "Error interno del servidor al crear grupos"
    };
  }
}

/**
 * Genera los partidos de todos contra todos para un grupo específico
 * @param groupId - ID del grupo
 * @returns Mensaje de éxito o error
 */
export async function generateGroupMatches(groupId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Obtener el grupo con sus jugadores
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });

    if (!group) {
      return { success: false, message: "Grupo no encontrado" };
    }

    if (group.players.length !== 4) {
      return { success: false, message: "El grupo debe tener exactamente 4 jugadores" };
    }

    // Verificar si ya existen partidos para este grupo
    const existingMatches = await prisma.match.count({
      where: { groupId }
    });

    if (existingMatches > 0) {
      return { success: false, message: "Ya existen partidos para este grupo" };
    }

    const players = group.players.map(p => p.player);
    const matches = [];

    // Generar partidos de todos contra todos (6 partidos para 4 jugadores)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];

        // Asignar aleatoriamente quién es local y quién visitante
        const isPlayer1Home = Math.random() > 0.5;

        matches.push({
          roundNumber: 1, // Todos los partidos de grupo son ronda 1
          groupId: group.id,
          homePlayerId: isPlayer1Home ? player1.id : player2.id,
          awayPlayerId: isPlayer1Home ? player2.id : player1.id,
          matchType: "GROUP_STAGE",
          status: "PENDING",
          deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días desde ahora
        });
      }
    }

    // Crear todos los partidos
    await prisma.match.createMany({
      data: matches
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Se generaron ${matches.length} partidos para el grupo ${group.name}`
    };

  } catch (error) {
    console.error("Error generando partidos de grupo:", error);
    return {
      success: false,
      message: "Error interno del servidor al generar partidos"
    };
  }
}

/**
 * Crea la fase de eliminatorias basada en la clasificación de los grupos
 * @param leagueId - ID de la liga
 * @returns Mensaje de éxito o error
 */
export async function createKnockoutStage(leagueId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        divisions: {
          include: {
            groups: {
              include: {
                players: {
                  include: {
                    player: true
                  }
                },
                matches: {
                  include: {
                    homePlayer: true,
                    awayPlayer: true,
                    winner: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!league) {
      return { success: false, message: "Liga no encontrada" };
    }

    // Verificar si ya existe una ronda de eliminatorias
    const existingKnockoutRound = await prisma.knockoutRound.findFirst({
      where: { leagueId }
    });

    if (existingKnockoutRound) {
      return { success: false, message: "Ya existe una fase de eliminatorias para esta liga" };
    }

    const allGroups = league.divisions.flatMap(div => div.groups);

    if (allGroups.length === 0) {
      return { success: false, message: "No hay grupos creados para esta liga" };
    }

    // Calcular clasificación de cada grupo
    const groupStandings = [];

    for (const group of allGroups) {
      const standings = await calculateGroupStandings(group);
      groupStandings.push({
        groupId: group.id,
        groupName: group.name,
        standings
      });
    }

    // Crear la ronda de eliminatorias (Octavos de Final)
    const knockoutRound = await prisma.knockoutRound.create({
      data: {
        leagueId,
        roundName: "Octavos de Final",
        roundOrder: 1
      }
    });

    // Generar los cruces para octavos de final
    const knockoutMatches = [];

    // Asumiendo que tenemos 8 grupos (2 por zona), creamos 8 partidos
    // 1º Grupo A vs 4º Grupo B, 2º Grupo A vs 3º Grupo B, etc.
    for (let i = 0; i < groupStandings.length; i += 2) {
      const groupA = groupStandings[i];
      const groupB = groupStandings[i + 1];

      if (groupA && groupB) {
        // 1º vs 4º
        knockoutMatches.push({
          roundNumber: 1,
          groupId: null,
          knockoutRoundId: knockoutRound.id,
          homePlayerId: groupA.standings[0].playerId,
          awayPlayerId: groupB.standings[3].playerId,
          matchType: "KNOCKOUT",
          status: "PENDING",
          deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días
        });

        // 2º vs 3º
        knockoutMatches.push({
          roundNumber: 1,
          groupId: null,
          knockoutRoundId: knockoutRound.id,
          homePlayerId: groupA.standings[1].playerId,
          awayPlayerId: groupB.standings[2].playerId,
          matchType: "KNOCKOUT",
          status: "PENDING",
          deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Crear todos los partidos de eliminatorias
    await prisma.match.createMany({
      data: knockoutMatches
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Se creó la fase de eliminatorias con ${knockoutMatches.length} partidos`
    };

  } catch (error) {
    console.error("Error creando fase de eliminatorias:", error);
    return {
      success: false,
      message: "Error interno del servidor al crear eliminatorias"
    };
  }
}

/**
 * Obtiene todas las zonas disponibles
 * @returns Lista de zonas
 */
type SimpleUser = {
  id: string;
  name: string | null;
  email: string | null;
  handicap: number;
  zoneId: string | null;
  zone?: { id: string; name: string } | null;
};

/**
 * Obtiene todas las zonas disponibles
 * @returns Lista de zonas
 */
export async function getAllZones(): Promise<{ success: boolean; data?: { id: string; name: string; description: string | null; isActive: boolean }[]; message?: string }> {
  try {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });

    return {
      success: true,
      data: zones
    };

  } catch (error) {
    console.error("Error obteniendo zonas:", error);
    return {
      success: false,
      message: "Error interno del servidor"
    };
  }
}

/**
 * Crea una nueva zona
 * @param name - Nombre de la zona
 * @param description - Descripción de la zona
 * @returns Mensaje de éxito o error
 */
export async function createZone(
  name: string,
  description?: string
): Promise<{ success: boolean; message: string; zoneId?: string }> {
  try {
    // Verificar que el nombre no esté en uso
    const existingZone = await prisma.zone.findUnique({
      where: { name }
    });

    if (existingZone) {
      return { success: false, message: "Ya existe una zona con este nombre" };
    }

    const zone = await prisma.zone.create({
      data: {
        name,
        description
      }
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `Zona "${name}" creada exitosamente`,
      zoneId: zone.id
    };

  } catch (error) {
    console.error("Error creando zona:", error);
    return {
      success: false,
      message: "Error interno del servidor al crear la zona"
    };
  }
}

/**
 * Obtiene usuarios disponibles por zona para una liga específica
 * @param leagueId - ID de la liga
 * @returns Usuarios agrupados por zona
 */
export async function getUsersByZone(leagueId: string): Promise<{
  success: boolean;
  data?: {
    usersByZone: Record<string, SimpleUser[]>;
    totalUsers: number;
    zones: string[]
  };
  message?: string
}> {
  try {
    // Verificar liga
    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) return { success: false, message: "Liga no encontrada" };

    // Obtener usuarios suscritos y pagados con su zona
    const subscriptions = await prisma.subscription.findMany({
      where: { leagueId, paid: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            handicap: true,
            zone: { select: { id: true, name: true } }
          }
        }
      }
    });

    // Map to SimpleUser type
    const subscribedUsers: SimpleUser[] = subscriptions.map((s) => ({
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      handicap: s.user.handicap,
      zoneId: s.user.zone?.id || null,
      zone: s.user.zone
    }));

    // Agrupar por zona
    const usersByZone: Record<string, SimpleUser[]> = {};
    for (const user of subscribedUsers) {
      const zid = user.zone?.id;
      if (!zid) continue;
      if (!usersByZone[zid]) usersByZone[zid] = [];
      usersByZone[zid].push(user);
    }

    return {
      success: true,
      data: {
        usersByZone,
        totalUsers: subscribedUsers.length,
        zones: Object.keys(usersByZone)
      }
    };

  } catch (error) {
    console.error("Error obteniendo usuarios por zona:", error);
    return {
      success: false,
      message: "Error interno del servidor"
    };
  }
}

/**
 * Calcula la clasificación de un grupo basada en los resultados de los partidos
 * @param group - Grupo con partidos y jugadores
 * @returns Array ordenado de jugadores por posición
 */
async function calculateGroupStandings(group: {
  players: { playerId: string; player: { name: string | null } }[];
  matches: {
    status: string;
    homePlayerScore: number | null;
    awayPlayerScore: number | null;
    homePlayerId: string;
    awayPlayerId: string;
  }[]
}) {
  const playerStats = new Map();

  // Inicializar estadísticas de cada jugador
  for (const playerAssignment of group.players) {
    playerStats.set(playerAssignment.playerId, {
      playerId: playerAssignment.playerId,
      playerName: playerAssignment.player.name,
      points: 0,
      matchesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      holesWon: 0,
      holesLost: 0
    });
  }

  // Procesar resultados de partidos
  for (const match of group.matches) {
    if (match.status === "COMPLETED" && match.homePlayerScore !== null && match.awayPlayerScore !== null) {
      const homeStats = playerStats.get(match.homePlayerId);
      const awayStats = playerStats.get(match.awayPlayerId);

      if (homeStats && awayStats) {
        // Actualizar partidos jugados
        homeStats.matchesPlayed++;
        awayStats.matchesPlayed++;

        // Determinar ganador y puntos
        if (match.homePlayerScore > match.awayPlayerScore) {
          homeStats.points += 3; // Victoria
          homeStats.gamesWon++;
          awayStats.gamesLost++;
        } else if (match.awayPlayerScore > match.homePlayerScore) {
          awayStats.points += 3; // Victoria
          awayStats.gamesWon++;
          homeStats.gamesLost++;
        } else {
          homeStats.points += 1; // Empate
          awayStats.points += 1; // Empate
        }

        // Actualizar hoyos ganados/perdidos
        homeStats.holesWon += match.homePlayerScore;
        homeStats.holesLost += match.awayPlayerScore;
        awayStats.holesWon += match.awayPlayerScore;
        awayStats.holesLost += match.homePlayerScore;
      }
    }
  }

  // Ordenar por puntos, luego por diferencia de hoyos
  return Array.from(playerStats.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const aDiff = a.holesWon - a.holesLost;
    const bDiff = b.holesWon - b.holesLost;
    return bDiff - aDiff;
  });
}
