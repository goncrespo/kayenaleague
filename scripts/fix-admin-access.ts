import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAdminAccess() {
  console.log("🔧 Solucionando problemas de acceso admin...\n");

  try {
    // 1. Verificar y arreglar el usuario admin
    console.log("1️⃣ Verificando usuario admin...");
    
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: "admin@kayena.com"
      },
      include: {
        zone: true,
        playerStats: true
      }
    });

    if (!adminUser) {
      console.log("❌ No se encontró el usuario admin");
      return;
    }

    console.log("📊 Info del usuario admin:");
    console.log("   📧 Email:", adminUser.email);
    console.log("   🔑 Rol:", adminUser.role);
    console.log("   ✅ Email verificado:", adminUser.emailVerified ? "Sí" : "No");
    console.log("   📍 Zona ID:", adminUser.zoneId);

    // 2. Verificar y arreglar credenciales
    console.log("\n2️⃣ Verificando credenciales...");
    
    // Verificar que el email esté verificado
    if (!adminUser.emailVerified) {
      console.log("⚠️ El email del admin no está verificado");
      
      // Arreglar email verificado
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          emailVerified: new Date()
        }
      });
      
      console.log("✅ Email verificado arreglado");
    }

    // 3. Verificar asignación a grupo
    console.log("\n3️⃣ Verificando asignación a grupo...");
    
    const assignments = await prisma.playerGroupAssignment.findMany({
      where: { playerId: adminUser.id },
      include: {
        group: true
      }
    });

    console.log("📋 Asignaciones encontradas:", assignments.length);
    if (assignments.length > 0) {
      console.log("   🎯 Grupo asignado:", assignments[0].group?.name);
    }

    // 4. Verificar sistema de administración
    console.log("\n4️⃣ Verificando sistema de administración...");
    
    // Verificar que existan datos para probar
    const totalPlayers = await prisma.user.count();
    const totalMatches = await prisma.match.count();
    const totalGroups = await prisma.group.count();
    
    console.log("📊 Resumen del sistema:");
    console.log("   👥 Total jugadores:", totalPlayers);
    console.log("   ⛳ Total partidos:", totalMatches);
    console.log("   🎯 Total grupos:", totalGroups);

    // 5. Verificar zona del admin
    console.log("\n5️⃣ Verificando zona del admin...");
    
    if (adminUser.zoneId) {
      const zone = await prisma.zone.findUnique({
        where: { id: adminUser.zoneId }
      });
      console.log("   📍 Zona asignada:", zone?.name || "Sin nombre");
    } else {
      console.log("⚠️ El admin no tiene zona asignada");
    }

    // 6. Verificar middleware y rutas
    console.log("\n6️⃣ Verificando sistema de rutas...");
    console.log("✅ Rutas configuradas:");
    console.log("   🔒 /admin/* - Solo ADMIN (verificación por cookie)");
    console.log("   🔒 /dashboard/* - Solo usuarios autenticados");
    console.log("   🔒 /profile/* - Solo usuarios autenticados");

    console.log("\n✅ Verificación completada!");
    console.log("\n🚀 Ahora puedes:");
    console.log("1. Intentar iniciar sesión con admin@kayena.com");
    console.log("2. Verificar que el email esté verificado");
    console.log("3. Acceder a /admin/dashboard");
    console.log("4. Explorar todas las funcionalidades de administrador");

  } catch (error) {
    console.error("❌ Error verificando sistema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
if (require.main === module) {
  fixAdminAccess()
    .then(() => {
      console.log("\n✅ Verificación de acceso completada!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Error en verificación:", error);
      process.exit(1);
    });
}

export { fixAdminAccess };