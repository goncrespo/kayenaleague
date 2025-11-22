import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession, setAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar que se proporcionaron email y contraseña
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Verificar credenciales
    const adminUser = await verifyAdminCredentials(email, password);

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear sesión
    const sessionToken = await createAdminSession(adminUser);
    
    // Establecer cookie de sesión
    await setAdminSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: "Sesión iniciada correctamente",
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });

  } catch (error) {
    console.error("Error en login de administrador:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
