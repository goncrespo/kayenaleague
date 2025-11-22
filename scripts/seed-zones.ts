#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedZones() {
  try {
    console.log("🌍 Poblando zonas iniciales...");

    const initialZones = [
      {
        name: "NOROESTE",
        description: "Zona Noroeste de la ciudad"
      },
      {
        name: "NORESTE", 
        description: "Zona Noreste de la ciudad"
      },
      {
        name: "SUROESTE",
        description: "Zona Suroeste de la ciudad"
      },
      {
        name: "SURESTE",
        description: "Zona Sureste de la ciudad"
      }
    ];

    for (const zoneData of initialZones) {
      // Verificar si la zona ya existe
      const existingZone = await prisma.zone.findUnique({
        where: { name: zoneData.name }
      });

      if (existingZone) {
        console.log(`⚠️  Zona "${zoneData.name}" ya existe`);
      } else {
        const zone = await prisma.zone.create({
          data: zoneData
        });
        console.log(`✅ Zona creada: ${zone.name} (${zone.id})`);
      }
    }

    // Mostrar todas las zonas
    const allZones = await prisma.zone.findMany({
      orderBy: { name: "asc" }
    });

    console.log("\n📋 Zonas disponibles:");
    allZones.forEach(zone => {
      console.log(`   • ${zone.name} - ${zone.description || "Sin descripción"}`);
    });

    console.log("\n🎉 Poblado de zonas completado exitosamente");

  } catch (error) {
    console.error("❌ Error poblando zonas:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedZones();
}

export { seedZones };
