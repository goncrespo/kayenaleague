import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateDatabase() {
  try {
    console.log("🚀 Iniciando migración de base de datos...");

    // 1. Actualizar el esquema de Prisma
    console.log("📋 Actualizando esquema de Prisma...");
    
    // Ejecutar migración de Prisma
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
      console.log("Ejecutando: npx prisma migrate dev...");
      const { stdout, stderr } = await execPromise('npx prisma migrate dev --name update-schema');
      if (stdout) console.log("✅ Migración exitosa:", stdout);
      if (stderr) console.log("⚠️  Advertencias:", stderr);
    } catch (error) {
      console.log("⚠️  Error en migración (puede ser normal si no hay cambios):", error.message);
    }

    // 2. Generar el cliente de Prisma
    console.log("🔧 Generando cliente de Prisma...");
    try {
      const { stdout, stderr } = await execPromise('npx prisma generate');
      if (stdout) console.log("✅ Cliente generado:", stdout);
      if (stderr) console.log("ℹ️  Info:", stderr);
    } catch (error) {
      console.log("⚠️  Error generando cliente:", error.message);
    }

    // 3. Sembrar las nuevas zonas de Madrid
    console.log("🌱 Sembrando zonas de Madrid...");
    const { seedZones } = await import('./seed-zones');
    await seedZones();

    // 4. Crear estadísticas iniciales para usuarios existentes
    console.log("📊 Creando estadísticas iniciales...");
    await createInitialStats();

    // 5. Actualizar estados de partidos existentes
    console.log("🔄 Actualizando estados de partidos...");
    await updateMatchStatuses();

    console.log("✅ Migración completada exitosamente!");

  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createInitialStats() {
  console.log("📈 Creando estadísticas iniciales para usuarios...");
  
  // Obtener todos los usuarios
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    // Verificar si ya tiene estadísticas
    const existingStats = await prisma.playerStats.findUnique({
      where: { userId: user.id }
    });

    if (!existingStats) {
      // Obtener partidos completados del usuario
      const completedMatches = await prisma.match.findMany({
        where: {
          OR: [
            { homePlayerId: user.id },
            { awayPlayerId: user.id }
          ],
          status: "COMPLETED"
        },
        include: {
          winner: true
        }
      });

      const totalMatches = completedMatches.length;
      const wins = completedMatches.filter(m => m.winner?.id === user.id).length;
      const losses = completedMatches.filter(m => m.winner && m.winner.id !== user.id).length;
      const draws = totalMatches - wins - losses;
      
      const totalPoints = (wins * 3) + (draws * 1);
      const avgPoints = totalMatches > 0 ? totalPoints / totalMatches : 0;

      // Calcular hoyos
      let holesWon = 0;
      let holesLost = 0;

      completedMatches.forEach(match => {
        if (match.homePlayerId === user.id) {
          holesWon += match.homePlayerScore || 0;
          holesLost += match.awayPlayerScore || 0;
        } else {
          holesWon += match.awayPlayerScore || 0;
          holesLost += match.homePlayerScore || 0;
        }
      });

      const holesDiff = holesWon - holesLost;

      // Crear estadísticas
      await prisma.playerStats.create({
        data: {
          userId: user.id,
          totalMatches,
          wins,
          draws,
          losses,
          totalPoints,
          avgPoints,
          holesWon,
          holesLost,
          holesDiff,
          currentStreak: 0,
          bestStreak: 0
        }
      });

      console.log(`✅ Estadísticas creadas para usuario: ${user.name || user.email}`);
    }
  }

  console.log("✅ Estadísticas iniciales creadas");
}

async function updateMatchStatuses() {
  console.log("🔄 Actualizando estados de partidos existentes...");
  
  // Actualizar todos los partidos sin estado a PENDING
  const result = await prisma.match.updateMany({
    where: { status: null },
    data: { status: "PENDING" }
  });

  console.log(`✅ ${result.count} partidos actualizados a estado PENDING`);

  // Actualizar resultados existentes a estado PENDING
  const resultsUpdate = await prisma.matchResult.updateMany({
    where: { status: null },
    data: { status: "PENDING" }
  });

  console.log(`✅ ${resultsUpdate.count} resultados actualizados a estado PENDING`);
}

// Ejecutar la migración
if (require.main === module) {
  migrateDatabase()
    .catch((error) => {
      console.error("Error fatal en la migración:", error);
      process.exit(1);
    });
}

export { migrateDatabase };