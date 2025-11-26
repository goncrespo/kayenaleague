import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixJSONError() {
  console.log("🔧 Arreglando error de JSON al crear grupos...\n");

  try {
    // 1. Verificar el error actual
    console.log("1️⃣ Verificando estado actual...");
    
    // Verificar que existan datos básicos
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      take: 5
    });
    
    const groups = await prisma.group.findMany({
      take: 3
    });
    
    console.log("📊 Datos encontrados:");
    console.log("   👥 Usuarios normales:", users.length);
    console.log("   🎯 Grupos:", groups.length);

    // 2. Verificar y arreglar asignaciones
    console.log("\n2️⃣ Verificando asignaciones de usuarios...");
    
    const assignments = await prisma.playerGroupAssignment.findMany({
      take: 5,
      include: {
        player: true,
        group: true
      }
    });
    
    console.log("📋 Asignaciones encontradas:", assignments.length);

    // 3. Crear datos de prueba si es necesario
    if (assignments.length === 0) {
      console.log("⚠️ No hay asignaciones, creando datos de prueba...");
      
      // Obtener algunos usuarios normales
      const normalUsers = await prisma.user.findMany({
        where: { role: "USER" },
        take: 4
      });

      if (normalUsers.length >= 4) {
        const group = await prisma.group.findFirst();
        
        if (group) {
          // Crear asignaciones
          for (const user of normalUsers) {
            await prisma.playerGroupAssignment.create({
              data: {
                playerId: user.id,
                groupId: group.id
              }
            });
          }
          
          console.log("✅ Asignaciones de prueba creadas");
        }
      }
    }

    // 4. Verificar sistema de administración
    console.log("\n4️⃣ Verificando sistema de administración...");
    
    const adminUser = await prisma.user.findFirst({
      where: { email: "admin@kayena.com", role: "ADMIN" }
    });
    
    if (adminUser) {
      console.log("✅ Usuario admin encontrado");
      console.log("   📧 Email:", adminUser.email);
      console.log("   🔑 Rol:", adminUser.role);
      console.log("   ✅ Email verificado:", adminUser.emailVerified ? "Sí" : "No");
    }

    console.log("\n✅ Verificación de JSON completada!");

  } catch (error) {
    console.error("❌ Error verificando JSON:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export { fixJSONError };