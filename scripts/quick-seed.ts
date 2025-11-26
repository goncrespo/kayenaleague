import { PrismaClient, ZoneName, MatchStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Usuarios de prueba con datos realistas
const TEST_USERS = [
  {
    name: "Javier", lastName: "García", email: "javier.garcia@email.com", handicap: 12.5, zone: "NORTE",
    phone: "600111111", license: "FGM123456"
  },
  {
    name: "María", lastName: "Rodríguez", email: "maria.rodriguez@email.com", handicap: 8.2, zone: "NORTE",
    phone: "600222222", license: "FGM123457"
  },
  {
    name: "Carlos", lastName: "González", email: "carlos.gonzalez@email.com", handicap: 15.8, zone: "SUR",
    phone: "600333333", license: "FGM123458"
  },
  {
    name: "Carmen", lastName: "Fernández", email: "carmen.fernandez@email.com", handicap: 18.4, zone: "SUR",
    phone: "600444444", license: "FGM123459"
  },
  {
    name: "Roberto", lastName: "López", email: "roberto.lopez@email.com", handicap: 22.1, zone: "CENTRO",
    phone: "600555555", license: "FGM123460"
  },
  {
    name: "Ana", lastName: "Martínez", email: "ana.martinez@email.com", handicap: 14.7, zone: "CENTRO",
    phone: "600666666", license: "FGM123461"
  },
  {
    name: "Manuel", lastName: "Sánchez", email: "manuel.sanchez@email.com", handicap: 9.3, zone: "ESTE",
    phone: "600777777", license: "FGM123462"
  },
  {
    name: "Pilar", lastName: "Pérez", email: "pilar.perez@email.com", handicap: 16.9, zone: "ESTE",
    phone: "600888888", license: "FGM123463"
  },
  {
    name: "Antonio", lastName: "Gómez", email: "antonio.gomez@email.com", handicap: 11.2, zone: "OESTE",
    phone: "600999999", license: "FGM123464"
  },
  {
    name: "Laura", lastName: "Ruiz", email: "laura.ruiz@email.com", handicap: 13.6, zone: "OESTE",
    phone: "600000000", license: "FGM123465"
  }
];

// Partidos de ejemplo
const MATCHES = [
  // Jornada 1
  { home: 0, away: 1, round: 1, homeScore: 12, awayScore: 14, status: "COMPLETED" },
  { home: 2, away: 3, round: 1, homeScore: 15, awayScore: 13, status: "COMPLETED" },
  { home: 4, away: 5, round: 1, homeScore: 18, awayScore: 16, status: "COMPLETED" },
  { home: 6, away: 7, round: 1, homeScore: 14, awayScore: 15, status: "COMPLETED" },
  { home: 8, away: 9, round: 1, homeScore: 13, awayScore: 12, status: "COMPLETED" },
  
  // Jornada 2
  { home: 0, away: 2, round: 2, homeScore: 16, awayScore: 15, status: "COMPLETED" },
  { home: 1, away: 3, round: 2, homeScore: 14, awayScore: 17, status: "PENDING" },
  { home: 4, away: 6, round: 2, homeScore: 15, awayScore: 14, status: "COMPLETED" },
  { home: 5, away: 7, round: 2, homeScore: 17, awayScore: 16, status: "PENDING" },
  { home: 8, away: 0, round: 2, homeScore: 12, awayScore: 15, status: "COMPLETED" },
  
  // Jornada 3 - Próximos partidos
  { home: 1, away: 4, round: 3, status: "PENDING" },
  { home: 2, away: 5, round: 3, status: "PENDING" },
  { home: 3, away: 6, round: 3, status: "PENDING" },
  { home: 7, away: 8, round: 3, status: "PENDING" },
  { home: 9, away: 1, round: 3, status: "PENDING" }
];

async function quickSeed() {
  try {
    console.log("🚀 Iniciando carga rápida de datos de prueba...");
    
    // 1. Limpiar datos de usuarios (mantener zonas y campos)
    console.log("🧹 Limpiando datos de usuarios...");
    await prisma.matchResult.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.playerGroupAssignment.deleteMany({});
    await prisma.playerStats.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
    
    // 2. Obtener zonas existentes
    console.log("📍 Obteniendo zonas existentes...");
    const zones = await prisma.zone.findMany();
    
    if (zones.length === 0) {
      console.log("❌ No hay zonas en la base de datos. Ejecuta 'npm run seed-zones' primero.");
      return;
    }
    
    // 3. Crear temporada y división básica
    console.log("📅 Creando estructura básica...");
    const season = await prisma.season.create({
      data: {
        name: "Temporada 2024",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        isActive: true
      }
    });
    
    const league = await prisma.league.create({
      data: {
        name: "Liga Madrid 2024",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-12-15")
      }
    });
    
    const division = await prisma.division.create({
      data: {
        name: "División 1",
        levelOrder: 1,
        seasonId: season.id,
        leagueId: league.id
      }
    });
    
    // Crear grupos
    const groups = [];
    for (let i = 0; i < 2; i++) {
      const group = await prisma.group.create({
        data: {
          name: `Grupo ${String.fromCharCode(65 + i)}`, // A, B
          divisionId: division.id
        }
      });
      groups.push(group);
    }
    
    // 4. Crear usuarios de prueba
    console.log("👥 Creando usuarios de prueba...");
    const createdUsers = [];
    
    for (let i = 0; i < TEST_USERS.length; i++) {
      const userData = TEST_USERS[i];
      const zone = zones.find(z => z.name === userData.zone) || zones[0];
      
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          emailVerified: new Date(),
          role: "USER",
          handicap: userData.handicap,
          handicapVerified: true,
          hashedPassword: bcrypt.hashSync("password123", 10),
          phone: userData.phone,
          licenseNumber: userData.license,
          city: "MADRID",
          playPreference: i % 2 === 0 ? "INDOOR_SIMULATOR" : "PRACTICE_RANGE",
          zoneId: zone.id
        }
      });
      createdUsers.push(user);
    }
    
    console.log(`✅ ${createdUsers.length} usuarios creados`);
    
    // 5. Crear suscripciones
    console.log("💳 Creando suscripciones...");
    for (const user of createdUsers) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          leagueId: league.id,
          paid: true,
          startDate: league.startDate,
          endDate: league.endDate
        }
      });
    }
    
    // 6. Asignar usuarios a grupos
    console.log("🎯 Asignando usuarios a grupos...");
    for (let i = 0; i < createdUsers.length; i++) {
      const groupIndex = i % groups.length;
      await prisma.playerGroupAssignment.create({
        data: {
          playerId: createdUsers[i].id,
          groupId: groups[groupIndex].id
        }
      });
    }
    
    // 7. Crear partidos
    console.log("⛳ Creando partidos de prueba...");
    for (const matchData of MATCHES) {
      const homePlayer = createdUsers[matchData.home];
      const awayPlayer = createdUsers[matchData.away];
      const group = groups[matchData.home % groups.length];
      
      const matchDate = matchData.status === "COMPLETED" 
        ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + Math.random() * 20 * 24 * 60 * 60 * 1000);
      
      const deadlineDate = new Date(matchDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const match = await prisma.match.create({
        data: {
          roundNumber: matchData.round,
          groupId: group.id,
          homePlayerId: homePlayer.id,
          awayPlayerId: awayPlayer.id,
          homePlayerScore: matchData.homeScore,
          awayPlayerScore: matchData.awayScore,
          matchType: "GROUP_STAGE",
          status: matchData.status as MatchStatus,
          matchDate: matchDate,
          deadlineDate: deadlineDate
        }
      });
      
      // Crear resultados para partidos completados
      if (matchData.status === "COMPLETED") {
        await prisma.matchResult.create({
          data: {
            matchId: match.id,
            reportedBy: homePlayer.id,
            homeScore: matchData.homeScore || 0,
            awayScore: matchData.awayScore || 0,
            status: "APPROVED",
            notes: "Partido completado"
          }
        });
      }
    }
    
    // 8. Crear estadísticas
    console.log("📊 Creando estadísticas...");
    for (const user of createdUsers) {
      const userMatches = await prisma.match.count({
        where: {
          OR: [{ homePlayerId: user.id }, { awayPlayerId: user.id }],
          status: "COMPLETED"
        }
      });
      
      const userWins = await prisma.match.count({
        where: { winnerId: user.id }
      });
      
      const totalPoints = (userWins * 3) + ((userMatches - userWins) * 0); // Simplificado
      
      await prisma.playerStats.create({
        data: {
          userId: user.id,
          totalMatches: userMatches,
          wins: userWins,
          draws: 0,
          losses: userMatches - userWins,
          totalPoints: totalPoints,
          avgPoints: userMatches > 0 ? totalPoints / userMatches : 0,
          holesWon: Math.floor(Math.random() * 50) + 20,
          holesLost: Math.floor(Math.random() * 40) + 15,
          holesDiff: Math.floor(Math.random() * 20) - 10,
          currentStreak: Math.floor(Math.random() * 3),
          bestStreak: Math.floor(Math.random() * 5) + 1
        }
      });
    }
    
    // 9. Crear preferencias de zona para algunos usuarios
    console.log("⚙️ Creando preferencias de zona...");
    for (let i = 0; i < createdUsers.length; i += 2) { // 50% de usuarios
      const user = createdUsers[i];
      const otherZone = zones.find(z => z.id !== user.zoneId) || zones[0];
      
      await prisma.zonePreference.create({
        data: {
          userId: user.id,
          homeZoneId: otherZone.id,
          travelRange: Math.floor(Math.random() * 45) + 5
        }
      });
    }
    
    console.log("✅ Datos de prueba creados exitosamente!");
    
    // Mostrar resumen
    console.log("\n📊 RESUMEN DE DATOS CREADOS:");
    console.log(`👥 Usuarios: ${createdUsers.length}`);
    console.log(`📊 Divisiones: 1`);
    console.log(`🎯 Grupos: ${groups.length}`);
    console.log(`💳 Suscripciones: ${createdUsers.length}`);
    console.log(`⛳ Partidos: ${MATCHES.length}`);
    console.log(`📈 Estadísticas: ${createdUsers.length}`);
    
    // Distribución por zonas
    console.log("\n🌍 DISTRIBUCIÓN POR ZONAS:");
    for (const zone of zones) {
      const usersInZone = createdUsers.filter(u => u.zoneId === zone.id).length;
      console.log(`${zone.name}: ${usersInZone} usuarios`);
    }
    
    console.log("\n✨ ¡Listo para probar el dashboard!");
    console.log("📱 Accede a /dashboard con cualquier usuario");
    console.log("🔑 Contraseña para todos: password123");
    console.log("\n📧 Usuarios de prueba:");
    TEST_USERS.forEach(user => {
      console.log(`- ${user.email} (${user.name} ${user.lastName})`);
    });
    
  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  quickSeed()
    .then(() => {
      console.log("\n🎉 Script de prueba completado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error en el script de prueba:", error);
      process.exit(1);
    });
}

export { quickSeed };