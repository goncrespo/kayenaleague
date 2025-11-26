import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixLoginSystem() {
  console.log("🔧 Arreglando sistema de login y verificación...\n");

  try {
    // 1. Verificar y arreglar el usuario admin
    console.log("1️⃣ Arreglando usuario admin...");
    
    // Primero, limpiar cualquier usuario admin existente mal configurado
    await prisma.user.updateMany({
      where: { email: "admin@kayena.com" },
      data: {
        emailVerified: new Date(),
        role: "ADMIN"
      }
    });

    // Crear/actualizar usuario admin correctamente
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@kayena.com" },
      update: {
        name: "Administrador",
        lastName: "Principal",
        role: "ADMIN",
        emailVerified: new Date(),
        handicap: 10.5,
        city: "MADRID" as any,
        phone: "600111222",
        licenseNumber: "FGM999999",
        zoneId: (await prisma.zone.findFirst({ where: { name: "CENTRO" as any } }))?.id || "1"
      },
      create: {
        name: "Administrador",
        lastName: "Principal",
        email: "admin@kayena.com",
        emailVerified: new Date(),
        role: "ADMIN",
        handicap: 10.5,
        city: "MADRID" as any,
        phone: "600111222",
        licenseNumber: "FGM999999",
        zoneId: (await prisma.zone.findFirst({ where: { name: "CENTRO" as any } }))?.id || "1",
        hashedPassword: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // Contraseña segura
        playPreference: "INDOOR_SIMULATOR"
      }
    });

    console.log("✅ Usuario admin arreglado:");
    console.log("   📧 Email:", adminUser.email);
    console.log("   🔑 Rol:", adminUser.role);
    console.log("   ✅ Email verificado:", adminUser.emailVerified ? "Sí" : "No");

    // 2. Crear estadísticas para el admin
    console.log("\n2️⃣ Creando estadísticas para admin...");
    await prisma.playerStats.upsert({
      where: { userId: adminUser.id },
      update: {
        totalMatches: 10,
        wins: 7,
        draws: 2,
        losses: 1,
        totalPoints: 23,
        avgPoints: 2.3,
        holesWon: 180,
        holesLost: 165,
        holesDiff: 15,
        currentStreak: 2,
        bestStreak: 3
      },
      create: {
        userId: adminUser.id,
        totalMatches: 10,
        wins: 7,
        draws: 2,
        losses: 1,
        totalPoints: 23,
        avgPoints: 2.3,
        holesWon: 180,
        holesLost: 165,
        holesDiff: 15,
        currentStreak: 2,
        bestStreak: 3
      }
    });

    // 3. Asignar a grupo (opcional)
    const group = await prisma.group.findFirst({
      where: { name: "Grupo A" }
    });

    if (group) {
      await prisma.playerGroupAssignment.upsert({
        where: {
          playerId_groupId: {
            playerId: adminUser.id,
            groupId: group.id
          }
        },
        update: {},
        create: {
          playerId: adminUser.id,
          groupId: group.id
        }
    });
    }

    console.log("✅ Usuario admin completamente configurado");

  } catch (error) {
    console.error("❌ Error arreglando sistema de login:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar arreglo
if (require.main === module) {
  fixLoginSystem()
    .then(() => {
      console.log("\n✅ Sistema de login arreglado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error en arreglo:", error);
      process.exit(1);
    });
}

export { fixLoginSystem };