import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_USER = {
  name: "Admin",
  lastName: "Principal",
  email: "admin@kayenaleague.com",
  password: "Admin123!",
  role: "ADMIN",
  handicap: 10.5,
  city: "MADRID",
  phone: "600111222",
  licenseNumber: "FGM999999",
  zone: "CENTRO"
};

async function createAdminUser() {
  try {
    console.log("🚀 Creando usuario administrador...");

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_USER.email }
    });

    if (existingUser) {
      console.log("⚠️ El usuario admin ya existe. Actualizando...");
      
      // Actualizar usuario existente
      const updatedUser = await prisma.user.update({
        where: { email: ADMIN_USER.email },
        data: {
          name: ADMIN_USER.name,
          lastName: ADMIN_USER.lastName,
          role: ADMIN_USER.role,
          handicap: ADMIN_USER.handicap,
          city: ADMIN_USER.city as any,
          phone: ADMIN_USER.phone,
          licenseNumber: ADMIN_USER.licenseNumber,
          zoneId: (await prisma.zone.findFirst({ where: { name: ADMIN_USER.zone as any } }))?.id,
          emailVerified: new Date(),
          hashedPassword: bcrypt.hashSync(ADMIN_USER.password, 10),
        }
      });

      console.log("✅ Usuario admin actualizado:", updatedUser.email);
      return updatedUser;
    }

    // Obtener zona del admin
    const adminZone = await prisma.zone.findFirst({
      where: { name: ADMIN_USER.zone as any }
    });

    if (!adminZone) {
      console.error("❌ No se encontró la zona para el admin");
      return null;
    }

    // Crear usuario administrador completo
    const adminUser = await prisma.user.create({
      data: {
        name: ADMIN_USER.name,
        lastName: ADMIN_USER.lastName,
        email: ADMIN_USER.email,
        emailVerified: new Date(),
        role: ADMIN_USER.role,
        handicap: ADMIN_USER.handicap,
        city: ADMIN_USER.city as any,
        phone: ADMIN_USER.phone,
        licenseNumber: ADMIN_USER.licenseNumber,
        zoneId: adminZone.id,
        hashedPassword: bcrypt.hashSync(ADMIN_USER.password, 10),
        playPreference: "INDOOR_SIMULATOR",
      }
    });

    // Crear estadísticas para el admin
    await prisma.playerStats.create({
      data: {
        userId: adminUser.id,
        totalMatches: 15,
        wins: 12,
        draws: 2,
        losses: 1,
        totalPoints: 38,
        avgPoints: 2.53,
        holesWon: 245,
        holesLost: 220,
        holesDiff: 25,
        currentStreak: 3,
        bestStreak: 5
      }
    });

    // Asignar a un grupo (opcional)
    const group = await prisma.group.findFirst({
      where: { name: "Grupo A" }
    });

    if (group) {
      await prisma.playerGroupAssignment.create({
        data: {
          playerId: adminUser.id,
          groupId: group.id
        }
    });
    }

    // Crear partidos para el admin (opcional)
    const adminMatches = [
      { homePlayerId: adminUser.id, awayPlayerId: "jugador2", homeScore: 15, awayScore: 12 },
      { homePlayerId: "jugador3", awayPlayerId: adminUser.id, homeScore: 14, awayScore: 16 }
    ];

    for (const matchData of adminMatches) {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 30);
      
      await prisma.match.create({
        data: {
          roundNumber: 1,
          groupId: group?.id || "1",
          homePlayerId: matchData.homePlayerId,
          awayPlayerId: matchData.awayPlayerId,
          homePlayerScore: matchData.homeScore,
          awayPlayerScore: matchData.awayScore,
          matchType: "GROUP_STAGE",
          status: "COMPLETED",
          deadlineDate: deadlineDate
        }
      });
    }

    console.log("✅ Usuario administrador creado exitosamente:");
    console.log("📧 Email:", adminUser.email);
    console.log("🔑 Contraseña:", ADMIN_USER.password);
    console.log("📊 Estadísticas creadas");
    console.log("🏆 Partidos creados");

    return adminUser;

  } catch (error) {
    console.error("❌ Error creando usuario admin:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  createAdminUser()
    .then((user) => {
      if (user) {
        console.log("\n🎉 Usuario administrador creado exitosamente!");
        console.log("\n📋 DATOS DE ACCESO:");
        console.log("📧 Email:", user.email);
        console.log("🔑 Contraseña:", ADMIN_USER.password);
        console.log("\n🚀 Ahora puedes:");
        console.log("1. Iniciar sesión en /signin");
        console.log("2. Ir a /admin/dashboard");
        console.log("3. Explorar todas las funcionalidades de administrador");
      } else {
        console.error("\n💥 Error al crear el usuario administrador");
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error fatal:", error);
      process.exit(1);
    });
}

export { createAdminUser };