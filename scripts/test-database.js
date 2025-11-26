const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Probando conexión a la base de datos...');
    
    // Verificar competiciones
    const competitions = await prisma.competition.findMany({
      take: 5,
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });
    
    console.log('Competiciones encontradas:', competitions.length);
    competitions.forEach(comp => {
      console.log(`- ${comp.name} (${comp.city}) - ${comp.players.length} jugadores`);
    });

    // Verificar usuarios
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        city: true
      }
    });
    
    console.log('\nUsuarios encontrados:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} ${user.lastName} (${user.city})`);
    });

    // Verificar grupos
    const groups = await prisma.group.findMany({
      take: 3,
      include: {
        players: true
      }
    });
    
    console.log('\nGrupos encontrados:', groups.length);
    groups.forEach(group => {
      console.log(`- ${group.name} - ${group.players.length} jugadores`);
    });

  } catch (error) {
    console.error('Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();