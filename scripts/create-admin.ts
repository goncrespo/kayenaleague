#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@kayena.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const name = process.env.ADMIN_NAME || "Administrador";

    console.log("🔐 Creando usuario administrador...");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Nombre: ${name}`);

    // Verificar si ya existe un administrador con este email
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("⚠️  Ya existe un usuario con este email");
      
      if (existingAdmin.role === "ADMIN") {
        console.log("✅ El usuario ya es administrador");
        return;
      } else {
        console.log("🔄 Actualizando rol a administrador...");
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: "ADMIN" },
        });
        console.log("✅ Rol actualizado a administrador");
        return;
      }
    }

    // Crear hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: "ADMIN",
        handicapVerified: true,
      },
    });

    console.log("✅ Usuario administrador creado exitosamente");
    console.log(`🆔 ID: ${adminUser.id}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Nombre: ${adminUser.name}`);
    console.log(`🔑 Rol: ${adminUser.role}`);

    console.log("\n🚀 Credenciales de acceso:");
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login");

  } catch (error) {
    console.error("❌ Error creando usuario administrador:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };
