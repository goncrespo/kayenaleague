import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

const COOKIE_NAME = "admin-session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verifica las credenciales del administrador
 * @param email - Email del administrador
 * @param password - Contraseña del administrador
 * @returns Usuario administrador si las credenciales son válidas, null en caso contrario
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hashedPassword: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return null;
    }

    // Verificar que el usuario tenga rol de administrador
    if (user.role !== "ADMIN") {
      return null;
    }

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
    };
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return null;
  }
}

/**
 * Crea una sesión JWT para el administrador
 * @param user - Usuario administrador
 * @returns Token JWT
 */
export async function createAdminSession(user: AdminUser): Promise<string> {
  const token = await new SignJWT({ 
    userId: user.id,
    email: user.email,
    role: user.role 
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifica y decodifica el token JWT de la sesión
 * @param token - Token JWT
 * @returns Payload del token si es válido, null en caso contrario
 */
export async function verifyAdminSession(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return null;
  }
}

/**
 * Obtiene la sesión actual del administrador desde las cookies
 * @returns Usuario administrador si la sesión es válida, null en caso contrario
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const payload = await verifyAdminSession(sessionToken);
    
    if (!payload) {
      return null;
    }

    // Verificar que el usuario aún existe y tiene rol de admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
    };
  } catch (error) {
    console.error("Error getting current admin:", error);
    return null;
  }
}

/**
 * Establece la cookie de sesión del administrador
 * @param token - Token JWT
 */
export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convertir a segundos
    path: "/",
  });
}

/**
 * Elimina la cookie de sesión del administrador
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Crea un hash seguro de la contraseña
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Crea un usuario administrador
 * @param email - Email del administrador
 * @param password - Contraseña del administrador
 * @param name - Nombre del administrador
 * @returns Usuario creado o null si hay error
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string
): Promise<AdminUser | null> {
  try {
    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("El email ya está en uso");
    }

    // Crear hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario administrador
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: "ADMIN",
        handicapVerified: true, // Los administradores no necesitan verificación de handicap
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return null;
  }
}
