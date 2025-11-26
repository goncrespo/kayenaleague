import { PrismaClient, City, CompetitionStatus, CompetitionType } from '@prisma/client';

const prisma = new PrismaClient();

const CITIES = [City.MADRID, City.ZARAGOZA, City.VALLADOLID] as const;

async function activateCompetitions() {
  try {
    console.log('🚀 Iniciando proceso de activación de competiciones...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Como estamos en noviembre 2025, la fecha de fin debe ser en 2026
    const june2026 = new Date('2026-06-30');
    june2026.setHours(23, 59, 59, 999); // Fin del día
    
    let createdCount = 0;
    let existingCount = 0;
    
    // Procesar cada ciudad
    for (const city of CITIES) {
      console.log(`📍 Procesando ciudad: ${city}`);
      
      // Buscar si existe una competición activa en esta ciudad
      // Una competición está activa si: isActive = true y la fecha actual está entre startDate y endDate
      const activeCompetition = await prisma.competition.findFirst({
        where: {
          city: city,
          isActive: true,
          startDate: {
            lte: today
          },
          endDate: {
            gte: today
          }
        }
      });
      
      if (activeCompetition) {
        console.log(`✅ Ya existe competición activa: ${activeCompetition.name} (ID: ${activeCompetition.id})`);
        existingCount++;
      } else {
        // Crear nueva competición
        const competitionName = `Liga ${city} 2025`;
        
        const newCompetition = await prisma.competition.create({
          data: {
            name: competitionName,
            type: CompetitionType.LEAGUE,
            status: CompetitionStatus.REGISTRATION,
            city: city,
            price: 40,
            startDate: today,
            endDate: june2026,
            isActive: true
          }
        });
        
        console.log(`✅ Competición creada: ${newCompetition.name} (ID: ${newCompetition.id})`);
        createdCount++;
      }
      
      console.log(''); // Línea en blanco entre ciudades
    }
    
    // Resumen final
    console.log('📊 RESUMEN DEL PROCESO:');
    console.log(`✅ Competiciones existentes: ${existingCount}`);
    console.log(`🆕 Competiciones creadas: ${createdCount}`);
    console.log(`📈 Total de competiciones procesadas: ${existingCount + createdCount}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso de activación de competiciones:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  activateCompetitions();
}