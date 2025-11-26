const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCompetitions() {
  try {
    // Crear competición de Madrid
    const madridCompetition = await prisma.competition.create({
      data: {
        name: 'Liga de Madrid 2024',
        description: 'Liga regular de golf para jugadores de Madrid',
        type: 'LEAGUE',
        status: 'REGISTRATION',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        price: 150.00,
        city: 'MADRID',
        isActive: true
      }
    });

    // Crear competición de Zaragoza
    const zaragozaCompetition = await prisma.competition.create({
      data: {
        name: 'Liga de Zaragoza 2024',
        description: 'Liga regular de golf para jugadores de Zaragoza',
        type: 'LEAGUE',
        status: 'DRAFT',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        price: 120.00,
        city: 'ZARAGOZA',
        isActive: false
      }
    });

    // Crear competición de Valladolid
    const valladolidCompetition = await prisma.competition.create({
      data: {
        name: 'Copa de Valladolid 2024',
        description: 'Torneo de golf para jugadores de Valladolid',
        type: 'CUP',
        status: 'DRAFT',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-10-31'),
        price: 200.00,
        city: 'VALLADOLID',
        isActive: false
      }
    });

    console.log('Competiciones creadas exitosamente:');
    console.log('- Liga de Madrid 2024:', madridCompetition.id);
    console.log('- Liga de Zaragoza 2024:', zaragozaCompetition.id);
    console.log('- Copa de Valladolid 2024:', valladolidCompetition.id);

    // Asignar algunos jugadores a la competición de Madrid
    const users = await prisma.user.findMany({
      where: { city: 'MADRID' },
      take: 5
    });

    for (const user of users) {
      await prisma.competitionPlayer.create({
        data: {
          competitionId: madridCompetition.id,
          playerId: user.id
        }
      });
    }

    console.log(`Asignados ${users.length} jugadores a la competición de Madrid`);

  } catch (error) {
    console.error('Error creando competiciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompetitions();