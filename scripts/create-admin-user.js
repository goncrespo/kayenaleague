const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = 'admin2@kayena.com';
    const adminPassword = 'admin123';
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log(`Usuario ${adminEmail} ya existe`);
      
      // Actualizar a rol ADMIN si no lo es
      if (existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: 'ADMIN' }
        });
        console.log(`Usuario ${adminEmail} actualizado a rol ADMIN`);
      }
      
      return existingUser;
    }

    // Crear nuevo usuario ADMIN
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        lastName: 'System',
        role: 'ADMIN',
        hashedPassword: hashedPassword,
        handicap: 36.0,
        city: 'MADRID'
      }
    });

    console.log('Usuario ADMIN creado exitosamente:');
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Password: ${adminPassword}`);
    console.log(`- ID: ${adminUser.id}`);

    return adminUser;

  } catch (error) {
    console.error('Error creando usuario ADMIN:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();