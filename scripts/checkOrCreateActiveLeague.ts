import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrCreateActiveLeague() {
  try {
    // Buscar si existe alguna competición activa
    const activeCompetition = await prisma.competition.findFirst({
      where: {
        isActive: true
      }
    });

    if (activeCompetition) {
      console.log(`✅ Ya existe una competición activa: ${activeCompetition.name} (ID: ${activeCompetition.id})`);
      return;
    }

    // Si no hay competición activa, crear una nueva
    const today = new Date();
    const june2025 = new Date('2025-06-30');

    const newCompetition = await prisma.competition.create({
      data: {
        name: 'Liga Kayena 2025',
        type: 'LEAGUE',
        status: 'REGISTRATION',
        city: 'MADRID',
        price: 50,
        startDate: today,
        endDate: june2025,
        isActive: true
      }
    });

    console.log(`✅ Competición creada exitosamente: ${newCompetition.name} (ID: ${newCompetition.id})`);
    
  } catch (error) {
    console.error('❌ Error al verificar o crear la competición:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
checkOrCreateActiveLeague();