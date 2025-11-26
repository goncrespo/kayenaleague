const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Crear zonas si no existen
  const zones = [
    { name: 'NORTE', description: 'Zona Norte' },
    { name: 'SUR', description: 'Zona Sur' },
    { name: 'CENTRO', description: 'Zona Centro' },
    { name: 'ESTE', description: 'Zona Este' },
    { name: 'OESTE', description: 'Zona Oeste' },
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { name: zone.name },
      update: {},
      create: {
        name: zone.name,
        description: zone.description,
        isActive: true,
        maxCapacity: 100,
      },
    });
  }

  // Crear una liga activa
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 30);

  const league = await prisma.league.create({
    data: {
      name: 'Liga 2025 - Temporada Actual',
      startDate: startDate,
      endDate: endDate,
    },
  });

  console.log('Liga creada:', league);

  // Asociar las zonas con la liga
  const allZones = await prisma.zone.findMany();
  for (const zone of allZones) {
    await prisma.leagueZone.create({
      data: {
        leagueId: league.id,
        zoneId: zone.id,
      },
    });
  }

  console.log('Zonas asociadas a la liga');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });