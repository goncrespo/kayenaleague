import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  try {
    // Eliminar cookie de sesión
    await clearAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });

  } catch (error) {
    console.error("Error en logout de administrador:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
