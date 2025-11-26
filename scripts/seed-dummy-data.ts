import { PrismaClient, ZoneName, MatchStatus, ResultStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Datos realistas para usuarios
const FIRST_NAMES = [
  "Javier", "Carlos", "Roberto", "Manuel", "Francisco", "Antonio", "Miguel", "José",
  "Pablo", "David", "Alberto", "Fernando", "Luis", "Sergio", "Álvaro", "Diego",
  "María", "Carmen", "Ana", "Isabel", "Pilar", "Dolores", "Teresa", "Rosa",
  "Sandra", "Elena", "Lucía", "Cristina", "Patricia", "Beatriz", "Silvia", "Clara"
];

const LAST_NAMES = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez",
  "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez",
  "Romero", "Alonso", "Gutiérrez", «Navarro», «Torres», «Domínguez», «Vázquez», «Ramos»,
  "Gil", «Ramírez», «Serrano», «Blanco», «Molina», «Morales», «Suárez», «Ortega»
];

const STREETS = [
  "Calle Mayor", "Calle Alcalá", "Calle Atocha", "Calle Princesa", "Calle Gran Vía",
  "Paseo del Prado", "Paseo de Recoletos", "Calle Serrano", "Calle Goya", "Calle Velázquez",
  "Avenida de América", «Avenida de Burgos», «Calle Bravo Murillo», «Calle Fuencarral»,
  «Calle Hortaleza», «Calle Toledo», «Calle San Bernardo», «Calle Alberto Aguilera»
];

const GOLF_COURSES = [
  "Club de Golf Santander", "Centro de Golf Lomas", "Golf Retiro", "PractiGolf Centro",
  «Campo de Golf Vallecas», «Golf Villaverde», «Golf Ciudad Lineal», «Campo de Golf San Blas»,
  «Club de Golf Moncloa», «Golf Latina», «Centro de Golf Hortaleza», «Golf Barajas»
];

// Generar datos de usuarios
function generateUsers(count: number) {
  const users = [];
  
  for (let i = 1; i <= count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
    
    users.push({
      name: firstName,
      lastName: lastName,
      email: email,
      emailVerified: new Date(),
      role: "USER",
      handicap: Math.round((Math.random() * 30 + 5) * 10) / 10, // Entre 5.0 y 35.0
      handicapVerified: Math.random() > 0.3, // 70% verificados
      phone: `6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      hashedPassword: bcrypt.hashSync("password123", 10),
      city: "MADRID",
      playPreference: Math.random() > 0.5 ? "INDOOR_SIMULATOR" : "PRACTICE_RANGE",
      licenseNumber: Math.random() > 0.8 ? `FGM${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}` : null
    });
  }
  
  return users;
}

// Generar direcciones por zona
function generateAddress(zoneName: ZoneName) {
  const street = STREETS[Math.floor(Math.random() * STREETS.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  const postalCode = getPostalCodeForZone(zoneName);
  
  return {
    street: `${street}, ${number}`,
    postalCode: postalCode,
    city: "Madrid"
  };
}

function getPostalCodeForZone(zoneName: ZoneName) {
  const postalCodes = {
    [ZoneName.NORTE]: [28001, 28002, 28003, 28004, 28033, 28034, 28035, 28036],
    [ZoneName.SUR]: [28007, 28018, 28019, 28021, 28024, 28025, 28026, 28027],
    [ZoneName.CENTRO]: [28012, 28013, 28014, 28015, 28016, 28028, 28029, 28030],
    [ZoneName.ESTE]: [28017, 28020, 28022, 28023, 28031, 28032, 28037, 28038],
    [ZoneName.OESTE]: [28008, 28009, 28010, 28011, 28039, 28040, 28041, 28042]
  };
  
  const codes = postalCodes[zoneName];
  return codes[Math.floor(Math.random() * codes.length)];
}

// Generar temporadas
function generateSeasons() {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      name: `Temporada ${currentYear}`,
      startDate: new Date(currentYear, 0, 1), // Enero 1
      endDate: new Date(currentYear, 11, 31), // Diciembre 31
      isActive: true
    },
    {
      name: `Temporada ${currentYear + 1}`,
      startDate: new Date(currentYear + 1, 0, 1),
      endDate: new Date(currentYear + 1, 11, 31),
      isActive: false
    }
  ];
}

// Generar divisiones y grupos
function generateDivisionsAndGroups(seasonId: string) {
  const divisions = [];
  const groups = [];
  
  // 3 divisiones por temporada
  for (let div = 1; div <= 3; div++) {
    const division = {
      name: `División ${div}`,
      levelOrder: div,
      seasonId: seasonId
    };
    divisions.push(division);
    
    // 4 grupos por división
    for (let group = 1; group <= 4; group++) {
      groups.push({
        name: `Grupo ${String.fromCharCode(64 + group)}`, // A, B, C, D
        divisionId: `div_${div}_${seasonId}`, // Placeholder, se actualizará
        level: div
      });
    }
  }
  
  return { divisions, groups };
}

// Generar ligas
function generateLeagues() {
  return [
    {
      name: "Liga Madrid 2024",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-12-15")
    },
    {
      name: "Liga Madrid 2025",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-12-15")
    }
  ];
}

// Generar suscripciones
function generateSubscriptions(users: any[], leagues: any[]) {
  const subscriptions = [];
  
  // 80% de usuarios tendrán suscripción
  users.forEach((user, index) => {
    if (Math.random() > 0.2) {
      const league = leagues[Math.floor(Math.random() * leagues.length)];
      subscriptions.push({
        userId: ``, // Se actualizará después
        leagueId: ``, // Se actualizará después
        paid: Math.random() > 0.1, // 90% pagadas
        startDate: league.startDate,
        endDate: league.endDate
      });
    }
  });
  
  return subscriptions;
}

// Generar partidos entre jugadores
function generateMatches(players: any[], groups: any[]) {
  const matches = [];
  
  groups.forEach((group, groupIndex) => {
    const groupPlayers = players.filter(p => p.groupId === group.id);
    
    // Solo crear partidos si hay al menos 2 jugadores en el grupo
    if (groupPlayers.length >= 2) {
      // Crear partidos todos contra todos en el grupo
      for (let i = 0; i < groupPlayers.length; i++) {
        for (let j = i + 1; j < groupPlayers.length; j++) {
          const player1 = groupPlayers[i];
          const player2 = groupPlayers[j];
          
          // Crear 2 partidos (ida y vuelta) entre cada pareja
          for (let matchNum = 0; matchNum < 2; matchNum++) {
            const isHomeFirst = matchNum === 0;
            const roundNumber = Math.floor(Math.random() * 10) + 1; // Jornadas 1-10
            
            // Decidir si el partido está completado o pendiente
            const status = Math.random() > 0.4 ? MatchStatus.COMPLETED : MatchStatus.PENDING;
            const matchDate = status === MatchStatus.COMPLETED 
              ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
              : new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Próximos 30 días
            
            const deadlineDate = new Date(matchDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después
            
            // Generar resultados para partidos completados
            let homeScore = undefined;
            let awayScore = undefined;
            let winnerId = undefined;
            
            if (status === MatchStatus.COMPLETED) {
              homeScore = Math.floor(Math.random() * 19); // 0-18 hoyos
              awayScore = Math.floor(Math.random() * 19);
              winnerId = homeScore > awayScore ? (isHomeFirst ? player1.id : player2.id) :
                          awayScore > homeScore ? (isHomeFirst ? player2.id : player1.id) :
                          undefined; // Empate
            }
            
            matches.push({
              roundNumber: roundNumber,
              groupId: ``, // Se actualizará después
              homePlayerId: isHomeFirst ? player1.id : player2.id,
              awayPlayerId: isHomeFirst ? player2.id : player1.id,
              homePlayerScore: homeScore,
              awayPlayerScore: awayScore,
              matchType: "GROUP_STAGE",
              winnerId: winnerId,
              status: status,
              matchDate: matchDate,
              deadlineDate: deadlineDate
            });
          }
        }
      }
    }
  });
  
  return matches;
}

// Generar estadísticas para usuarios
function generatePlayerStats(users: any[], matches: any[]) {
  const stats = [];
  
  users.forEach(user => {
    const userMatches = matches.filter(m => 
      (m.homePlayerId === user.id || m.awayPlayerId === user.id) && 
      m.status === MatchStatus.COMPLETED
    );
    
    const wins = userMatches.filter(m => m.winnerId === user.id).length;
    const losses = userMatches.filter(m => m.winnerId && m.winnerId !== user.id).length;
    const draws = userMatches.length - wins - losses;
    
    const totalPoints = (wins * 3) + (draws * 1);
    const avgPoints = userMatches.length > 0 ? totalPoints / userMatches.length : 0;
    
    // Calcular hoyos
    let holesWon = 0;
    let holesLost = 0;
    
    userMatches.forEach(match => {
      if (match.homePlayerId === user.id) {
        holesWon += match.homePlayerScore || 0;
        holesLost += match.awayPlayerScore || 0;
      } else {
        holesWon += match.awayPlayerScore || 0;
        holesLost += match.homePlayerScore || 0;
      }
    });
    
    const holesDiff = holesWon - holesLost;
    
    // Calcular rachas (simplificado)
    const currentStreak = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
    const bestStreak = Math.max(currentStreak, Math.floor(Math.random() * 8) + 1);
    
    stats.push({
      userId: user.id,
      totalMatches: userMatches.length,
      wins: wins,
      draws: draws,
      losses: losses,
      totalPoints: totalPoints,
      avgPoints: avgPoints,
      holesWon: holesWon,
      holesLost: holesLost,
      holesDiff: holesDiff,
      currentStreak: currentStreak,
      bestStreak: bestStreak
    });
  });
  
  return stats;
}

// Script principal
async function seedDummyData() {
  try {
    console.log("🚀 Iniciando carga de datos dummy...");
    
    // 1. Limpiar datos existentes (mantener zonas y campos)
    console.log("🧹 Limpiando datos existentes...");
    await prisma.matchResult.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.playerGroupAssignment.deleteMany({});
    await prisma.playerStats.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.division.deleteMany({});
    await prisma.season.deleteMany({});
    await prisma.league.deleteMany({});
    
    // 2. Crear ligas
    console.log("🏆 Creando ligas...");
    const leagues = generateLeagues();
    const createdLeagues = [];
    for (const league of leagues) {
      const created = await prisma.league.create({ data: league });
      createdLeagues.push(created);
    }
    
    // 3. Crear temporadas
    console.log("📅 Creando temporadas...");
    const seasons = generateSeasons();
    const createdSeasons = [];
    for (const season of seasons) {
      const created = await prisma.season.create({ data: season });
      createdSeasons.push(created);
    }
    
    // 4. Crear divisiones y grupos
    console.log("📊 Creando divisiones y grupos...");
    const allDivisions = [];
    const allGroups = [];
    
    for (const season of createdSeasons) {
      const { divisions, groups } = generateDivisionsAndGroups(season.id);
      
      for (const division of divisions) {
        const createdDivision = await prisma.division.create({ 
          data: { ...division, leagueId: createdLeagues[0].id }
        });
        allDivisions.push(createdDivision);
        
        // Crear grupos para esta división
        const divisionGroups = groups.filter(g => g.level === division.levelOrder);
        for (const group of divisionGroups) {
          const createdGroup = await prisma.group.create({
            data: { ...group, divisionId: createdDivision.id }
          });
          allGroups.push(createdGroup);
        }
      }
    }
    
    // 5. Crear usuarios
    console.log("👥 Creando usuarios dummy...");
    const usersData = generateUsers(50); // 50 usuarios
    const createdUsers = [];
    
    // Obtener zonas existentes
    const zones = await prisma.zone.findMany();
    
    for (const userData of usersData) {
      // Asignar zona aleatoriamente
      const randomZone = zones[Math.floor(Math.random() * zones.length)];
      
      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          zoneId: randomZone.id
        }
      });
      createdUsers.push(createdUser);
    }
    
    console.log(`✅ ${createdUsers.length} usuarios creados`);
    
    // 6. Crear suscripciones
    console.log("💳 Creando suscripciones...");
    const subscriptionsData = generateSubscriptions(createdUsers, createdLeagues);
    
    for (const subscription of subscriptionsData) {
      await prisma.subscription.create({
        data: {
          ...subscription,
          userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
          leagueId: createdLeagues[Math.floor(Math.random() * createdLeagues.length)].id
        }
      });
    }
    
    // 7. Asignar usuarios a grupos
    console.log("🎯 Asignando usuarios a grupos...");
    const assignments = [];
    
    // Distribuir usuarios equitativamente entre grupos
    allGroups.forEach((group, groupIndex) => {
      const usersPerGroup = Math.floor(createdUsers.length / allGroups.length);
      const startIdx = groupIndex * usersPerGroup;
      const endIdx = startIdx + usersPerGroup;
      
      const groupUsers = createdUsers.slice(startIdx, endIdx);
      
      groupUsers.forEach(user => {
        assignments.push({
          playerId: user.id,
          groupId: group.id
        });
      });
    });
    
    for (const assignment of assignments) {
      await prisma.playerGroupAssignment.create({ data: assignment });
    }
    
    // 8. Crear partidos
    console.log("⛳ Creando partidos...");
    const matchesData = generateMatches(createdUsers, allGroups);
    
    for (const match of matchesData) {
      // Encontrar jugadores reales
      const homePlayer = createdUsers.find(u => u.email.includes(`user${match.homePlayerId}`));
      const awayPlayer = createdUsers.find(u => u.email.includes(`user${match.awayPlayerId}`));
      const group = allGroups.find(g => g.id === match.groupId);
      
      if (homePlayer && awayPlayer && group) {
        await prisma.match.create({
          data: {
            ...match,
            homePlayerId: homePlayer.id,
            awayPlayerId: awayPlayer.id,
            groupId: group.id
          }
        });
      }
    }
    
    // 9. Crear estadísticas
    console.log("📊 Creando estadísticas de jugadores...");
    const statsData = generatePlayerStats(createdUsers, matchesData);
    
    for (const stat of statsData) {
      await prisma.playerStats.create({ data: stat });
    }
    
    // 10. Crear algunos resultados de partidos
    console.log("📝 Creando resultados de partidos...");
    const completedMatches = await prisma.match.findMany({
      where: { status: MatchStatus.COMPLETED },
      take: 30 // Solo para algunos partidos
    });
    
    for (const match of completedMatches) {
      const result = await prisma.matchResult.create({
        data: {
          matchId: match.id,
          reportedBy: match.homePlayerId,
          homeScore: match.homePlayerScore || 0,
          awayScore: match.awayPlayerScore || 0,
          status: ResultStatus.APPROVED, // Aprobados para pruebas
          notes: "Partido jugado y validado"
        }
      });
    }
    
    // 11. Crear preferencias de zona para algunos usuarios
    console.log("⚙️ Creando preferencias de zona...");
    const zonePreferences = [];
    
    // 60% de usuarios tendrán preferencias
    createdUsers.forEach((user, index) => {
      if (index % 10 < 6) { // 60% de usuarios
        zonePreferences.push({
          userId: user.id,
          homeZoneId: zones[Math.floor(Math.random() * zones.length)].id,
          travelRange: Math.floor(Math.random() * 45) + 5, // 5-50 km
          preferences: {
            preferredDays: ["saturday", "sunday"],
            preferredTime: "morning"
          }
        });
      }
    });
    
    for (const preference of zonePreferences) {
      await prisma.zonePreference.create({ data: preference });
    }
    
    console.log("✅ Datos dummy creados exitosamente!");
    
    // Mostrar resumen
    console.log("\n📊 RESUMEN DE DATOS CREADOS:");
    console.log(`👥 Usuarios: ${createdUsers.length}`);
    console.log(`🏆 Ligas: ${createdLeagues.length}`);
    console.log(`📅 Temporadas: ${createdSeasons.length}`);
    console.log(`📊 Divisiones: ${allDivisions.length}`);
    console.log(`🎯 Grupos: ${allGroups.length}`);
    console.log(`💳 Suscripciones: ${subscriptionsData.length}`);
    console.log(`⛳ Partidos: ${matchesData.length}`);
    console.log(`📈 Estadísticas: ${statsData.length}`);
    console.log(`⚙️ Preferencias de zona: ${zonePreferences.length}`);
    
    // Mostrar distribución por zonas
    console.log("\n🌍 DISTRIBUCIÓN POR ZONAS:");
    for (const zone of zones) {
      const usersInZone = createdUsers.filter(u => u.zoneId === zone.id).length;
      console.log(`${zone.name}: ${usersInZone} usuarios`);
    }
    
  } catch (error) {
    console.error("❌ Error creando datos dummy:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  seedDummyData()
    .then(() => {
      console.log("\n🎉 Script completado exitosamente!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error fatal en el script:", error);
      process.exit(1);
    });
}

export { seedDummyData };